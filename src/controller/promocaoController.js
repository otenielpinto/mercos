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
  await setPromocaoVigente();
}

//processar as filas de promocao
async function processarFilaPromocao() {
  const filaPromocao = new FilaPromocaoRepository();

  let filas = await filaPromocao.findAll({});
  if (!Array.isArray(filas) || filas.length == 0) return;

  for (let fila of filas) {
  }

  console.log("fim do processamento da fila de promocao");
  return;
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

    if (data_final < new Date()) {
      console.log("Produto com promocao expirada: ", p.codigo);
      continue;
    }

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
        nome: "promocao",
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

async function getAllPromocoes() {
  const promocaoRepo = new PromocaoRepository();
  return await promocaoRepo.findAll({});
}

//********************************************************************************** */
async function getPromocaoVigente() {
  let filter = { preco_promocional: { $gt: 0 } };
  const anuncios = new MpkAnuncio();
  const rows = await anuncios.findAll(filter);
  const promocao = await mapperToPromocoes(rows);
  return promocao;
}

async function setPromocaoVigente() {
  let promocoes = await getPromocaoVigente();
  if (!Array.isArray(promocoes) || promocoes.length == 0) return;
  let promocaoRepo = new PromocaoRepository();
  //nao pode mudar o nome da promocao
  let items = await promocaoRepo.findAll({ nome: "Promocao" });
  let promocaoExists = null;
  for (let item of items) {
    promocaoExists = item;
    break;
  }

  //data ontem para garantir que a promocao sera atualizada
  let data_inicial = formatarData(
    new Date(new Date().setDate(new Date().getDate() - 20))
  );
  let data_final = formatarData(
    new Date(new Date().setMonth(new Date().getMonth() + 2))
  ); //60 dias a partir de hoje

  const regras = [];
  for (let p of promocoes) {
    regras.push({
      produto_id: p.id_produto_mercos,
      desconto: p.desconto,
    });
  }

  let body = {
    nome: "Promocao",
    data_inicial: data_inicial,
    data_final: data_final,
    regras: regras,
  };
  let result = null;
  let id_promocao = promocaoExists?.id ? promocaoExists?.id : null;

  if (!promocaoExists) {
    //vamos criar a promocao
    console.log("Criando nova promocao");

    for (let i = 1; i < MAX_TENTATIVAS; i++) {
      result = await mercosService.createPromocoes(body);
      if ((await lib.tratarRetorno(result, 201)) == 201) {
        body.id = result?.data?.id;
        await promocaoRepo.create(body);
        break;
      }
      await lib.sleep(500);
    }
  } else {
    //vamos atualizar a promocao
    console.log("Atualizando promocao existente: ", id_promocao);

    for (let i = 1; i < MAX_TENTATIVAS; i++) {
      result = await mercosService.updatePromocoes(id_promocao, body);
      if ((await lib.tratarRetorno(result, 200)) == 200) {
        //orientação da Mercos que pode mudar
        body.id = result?.data?.id;
        body.updatedAt = new Date();
        await promocaoRepo.update(id_promocao, body);
        break;
      }
      await lib.sleep(500);
    }
  }
}

//********************************************************************************** */

module.exports = {
  init,
  mapperToPromocoes,
  getAllPromocoes,
  getPromocoesByDias,
  calcularPercentualDesconto,
  inserirFilaPromocao,
  getPromocaoVigente,
};
