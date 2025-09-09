const lib = require("../utils/lib");
const mercosService = require("../services/mercosService");
const {
  FilaPromocaoRepository,
} = require("../repository/filaPromocaoRepository");
const { PromocaoRepository } = require("../repository/promocaoRepository");
const { MpkAnuncio } = require("../repository/anuncioRepository");
const TSystemService = require("../services/systemService");

const MAX_TENTATIVAS = 10;

async function init() {
  await tarefasDiarias();
  console.log("processando fila de promocao");
  await processarFilaPromocao();
}

async function tarefasDiarias() {
  let id_tenant = lib.config_id_integracao();

  if ((await TSystemService.started(id_tenant, "auto_limpeza_promocao")) == 1)
    return;

  console.log("processando auto limpeza de promocoes");
  await autoLimpezaPromocoes();
}

//processar as filas de promocao
async function processarFilaPromocao() {
  const filaPromocao = new FilaPromocaoRepository();

  let filas = await filaPromocao.findAll({});
  if (!Array.isArray(filas) || filas.length == 0) return;

  for (let fila of filas) {
    let response = await setPromocao(fila);
    if (response) {
      console.log("Promocao processada com sucesso: ", fila.sku);
      await filaPromocao.delete(fila.id);
    }
  }

  console.log("fim do processamento da fila de promocao");
  return;
}

async function setPromocao(item) {
  if (!item) return true;
  let result = null;

  const promocaoRepo = new PromocaoRepository();
  let promocaoExists = await promocaoRepo.findBySku(item.sku);

  let preco_original = Number(item.preco_original) ?? 0;
  let preco_promocional = Number(item.preco_promocional) ?? 0;
  let desconto = Number(item.desconto) ?? 0;
  let data_inicial = formatarData(item.data_inicial);
  let data_final = formatarData(item.data_final);
  let id_promocao = promocaoExists?.id_promocao
    ? promocaoExists?.id_promocao
    : null;
  let excluido = data_final < new Date();

  if (!id_promocao && excluido == true) {
    //se nao existe a promocao e ja esta excluida, nada a fazer
    return true;
  }

  let body = {
    nome: "promocao-" + item.sku,
    data_inicial: data_inicial,
    data_final: data_final,
    excluido: excluido,
    regras: [
      {
        produto_id: item.id_produto_mercos,
        desconto: desconto,
      },
    ],
  };

  if (id_promocao) {
    let updated =
      preco_original == promocaoExists?.preco_original &&
      preco_promocional == promocaoExists?.preco_promocional &&
      desconto == promocaoExists?.desconto &&
      data_inicial == promocaoExists?.data_inicial &&
      data_final == promocaoExists?.data_final;

    //ja existe a promocao e o preco promocional é o mesmo, nada a fazer
    if (updated == true && excluido == false) return true;

    //atualizar a promocao
    return await updatePromocao(id_promocao, item);
  }

  if (!id_promocao || id_promocao == null) {
    delete body.excluido; //nao pode enviar o campo excluido na criacao da promocao
    for (let i = 1; i < MAX_TENTATIVAS; i++) {
      result = await mercosService.createPromocoes(body);
      //console.log(result?.response?.data);
      if ((await lib.tratarRetorno(result, 201)) == 201) {
        body.id_promocao = result?.data?.id;
        await promocaoRepo.create(body);
        return true;
      }
      await lib.sleep(500);
    }
  }

  return null;
}

// Função para calcular o percentual de desconto
function calcularPercentualDesconto(precoOriginal, precoPromocional) {
  if (!precoOriginal || precoOriginal === 0) return 0;

  const desconto = ((precoOriginal - precoPromocional) / precoOriginal) * 100;
  return Math.round(desconto * 100) / 100; // Arredonda para 2 casas decimais
}

//function para devoler a data no formato yyyy-mm-dd
function formatarData(data) {
  if (!data) return null;

  const d = new Date(data);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
//filtar os produtos que estao em promocao
async function mapperToPromocoes(items) {
  if (!Array.isArray(items) || items.length == 0) return [];

  let promocoes = [];
  for (let p of items) {
    let preco_promocional = Number(p.preco_promocional) ?? 0;
    if (!preco_promocional || preco_promocional == 0) continue;

    let preco_original = Number(p.preco_original) ?? 0;
    let id_anuncio_mktplace = String(p.id_anuncio_mktplace);
    let meuspedidosid = String(p.meuspedidosid);
    if (!id_anuncio_mktplace && meuspedidosid)
      id_anuncio_mktplace = String(meuspedidosid);
    let sku = p.sku;
    let data_inicial = null;
    let data_final = null;
    if (p?.dt_promocao_ini) data_inicial = p.dt_promocao_ini;
    if (p?.dt_promocao_fim) data_final = p.dt_promocao_fim;

    if (
      !id_anuncio_mktplace ||
      preco_promocional == 0 ||
      preco_original == 0 ||
      data_inicial == null ||
      data_final == null
    ) {
      console.log(
        "Produto sem informacoes suficientes para promocao: ",
        p.codigo
      );
      continue;
    }

    if (preco_promocional < preco_original) {
      let desconto = calcularPercentualDesconto(
        preco_original,
        preco_promocional
      );
      if (desconto <= 0) continue;

      promocoes.push({
        id: p.codigo,
        sku: sku,
        id_produto_mercos: id_anuncio_mktplace,
        preco_original: preco_original,
        preco_promocional: preco_promocional,
        data_inicial: data_inicial,
        data_final: data_final,
        desconto: desconto,
        updatedAt: new Date(),
      });
    }
  }
  return promocoes;
}

//esta function é acionada dentro do produtoController atraves do gatilho update preço  29-08-2025
async function inserirFilaPromocao(produtos) {
  let promocoes = await mapperToPromocoes(produtos);
  const filaPromocao = new FilaPromocaoRepository();
  await filaPromocao.insertMany(promocoes);
}

async function getPromocoesByDias(numero_dias) {
  let alterado_apos = lib.getAlterado_apos(numero_dias, "00:00:00");
  let result = null;
  let eof = 1;
  let lote = [];
  while (eof > 0) {
    result = await mercosService.getPromocoes(alterado_apos);
    if ((await lib.tratarRetorno(result, 200)) != 200) {
      continue;
    }
    eof = result?.data?.length ? result?.data?.length : 0;
    let items = result?.data;
    if (!Array.isArray(items)) items = [];
    for (let item of items) {
      alterado_apos = `alterado_apos=${item.ultima_alteracao}`;
      lote.push(item);
    }
  }

  return lote;
}

async function autoLimpezaPromocoesApiMercos() {
  //
  let dias = -365;
  let promocoes = await getPromocoesByDias(dias);
  let promocaoRepo = new PromocaoRepository();
  if (!Array.isArray(promocoes) || promocoes.length == 0) return;

  for (let promocao of promocoes) {
    if (promocao.excluido == true) {
      console.log("Promocao ja esta excluida: ", promocao.id);
      continue;
    }

    let id_promocao = promocao.id;
    let data_final = new Date(promocao.data_final);
    let hoje = new Date();
    let result = null;
    let fimPromocao = data_final < hoje;

    if (fimPromocao) {
      let body = {
        nome: "promocao-" + promocao.sku,
        data_inicial: promocao.data_inicial,
        data_final: promocao.data_final,
        excluido: true,
        regras: promocao.regras,
      };

      for (let i = 1; i < MAX_TENTATIVAS; i++) {
        result = await mercosService.updatePromocoes(id_promocao, body);
        console.log(result.response.data);

        if ((await lib.tratarRetorno(result, 200)) == 200) {
          console.log("promocao excluida com sucesso: ", promocao.sku);
        }
      }
    }
  }
}
/*
  Essa function cruza as promocoes  com os anuncios e verifica se o preco promocional
  ainda esta vigente, caso o preco promocional seja zero ou nulo, a promocao sera excluida
  sera executada uma vez ao dia
*/
async function autoLimpezaPromocoes() {
  let promocoes = await getAllPromocoes();
  if (!Array.isArray(promocoes) || promocoes.length == 0) return;
  let anuncio = new MpkAnuncio();
  let preco_promocional = 0;

  for (let promocao of promocoes) {
    let rows = await anuncio.findAll({ sku: promocao?.sku });
    for (let row of rows) {
      preco_promocional = Number(row?.preco_promocional) ?? 0;
      if (preco_promocional <= 0) {
        //diminir o dia de hoje para garantir que a promocao sera excluida
        let hoje = new Date();
        hoje.setDate(hoje.getDate() - 1);
        promocao.data_final = hoje;
        let res = await updatePromocao(promocao?.id_promocao, promocao);
      }
    }
  }
}

async function getAllPromocoes() {
  const promocaoRepo = new PromocaoRepository();
  return await promocaoRepo.findAll({});
}

async function updatePromocao(id_promocao, payload) {
  if (!id_promocao) return null;
  let promocaoRepo = new PromocaoRepository();
  let result = null;
  let data_final = new Date(payload.data_final);
  let excluido = data_final < hoje;

  let body = {
    nome: "promocao-" + payload.sku,
    data_inicial: formatarData(payload.data_inicial),
    data_final: formatarData(payload.data_final),
    excluido: excluido,
    regras: [
      {
        produto_id: payload.id_produto_mercos,
        desconto: payload.desconto,
      },
    ],
  };
  let id = payload.id;

  for (let i = 1; i < MAX_TENTATIVAS; i++) {
    result = await mercosService.updatePromocoes(id_promocao, body);
    if ((await lib.tratarRetorno(result, 200)) == 200) {
      body.id_promocao = result?.data?.id;

      if (excluido) {
        await promocaoRepo.delete(id);
        console.log("excluindo promocao do banco local: ", payload.sku);
        return true;
      } else {
        await promocaoRepo.update(id, payload);
        console.log("atualizando promocao do banco local: ", payload.sku);
        return true;
      }
    }
    await lib.sleep(500);
  }
  //nao conseguiu atualizar a promocao
  return null;
}

module.exports = {
  init,
  mapperToPromocoes,
  getAllPromocoes,
  getPromocoesByDias,
  autoLimpezaPromocoes,
  calcularPercentualDesconto,
  inserirFilaPromocao,
};
