const TMongo = require("../infra/mongoClient");
const { fbImageByIdProduto } = require("../infra/fbImage");
const fb5 = require("../infra/fb5");
const lib = require("../utils/lib");
const mercosService = require("../services/mercosService");
const TCategoriaMappers = require("../mappers/categoriaMappers");
const TProdutoMappers = require("../mappers/produtoMappers");
const TAnuncio = require("../repository/anuncioRepository");
const TAnuncioTypes = require("../types/anuncioTypes");
const TCategoriaController = require("./categoriaController");
let LISTA_OF_CATEGORIAS = [];
const MAX_CMD_SQL = 100;
const MAX_RECORDS_LOTE = 300; //quantidade de registros por lote

async function updateAnuncioForced() {
  let cmd_sql = ` 
  SELECT * FROM MPK_UPDANUNCIOFORCED
  `;
  return await fb5.executeQuery(cmd_sql, []);
}

async function updateAnuncioSQL(items) {
  if (!items) return;
  if (items?.length == 0) return;
  let processado = 1; //processado

  let lote = [];
  for (let item of items) {
    lote.push({
      cmd_sql: `UPDATE MPK_ANUNCIO SET STATUS=${processado} WHERE ID=${item?.id} AND STATUS=0 ;\n`,
      params: [],
    });
  }

  await fb5.executeArraySQL(lote);
}

async function updateEstoqueSQL(items) {
  if (!items) return;
  if (items?.length == 0) return;
  let processado = 1; //processado
  let lote = [];

  for (let item of items) {
    lote.push({
      cmd_sql: `UPDATE MPK_VARIACAO SET STATUS=${processado} WHERE ID_ANUNCIO=${item?.id} AND STATUS=0 ;\n`,
      params: [],
    });
  }
  await fb5.executeArraySQL(lote);
}

async function init() {
  await updateAnuncioForced();

  //modulo client
  if (lib.config_modulo_client() == 1) {
    await enviarAnunciosPendente();
  }

  //modulo servidor
  if (lib.config_modulo_server() == 1) {
    await ajustar_estoque_em_lote();
    await enviarTodosAnunciosB2B();
  }

  //Marcar produtos como processados
  if (lib.config_modulo_client() == 1) {
    await recebeAnunciosProcessado();
  }

  // so quando estiver implantando  # precisa status=0 nos produtos que precisa atualizar
  //await enviarFotosEmLote();
}

async function ajustar_estoque_em_lote() {
  const anuncio = new TAnuncio.MpkAnuncio(await TMongo.mongoConnect());
  const rows = await anuncio.findAll({
    status: TAnuncioTypes.anuncioTypes.pendente,
  });
  let result;
  let lote = [];
  for (let row of rows) {
    if (!row?.meuspedidosid) continue; //provisoria nos testes
    let obj = {
      produto_id: row?.meuspedidosid,
      novo_saldo: row?.estoque,
    };
    lote.push(obj);

    if (lote.length >= MAX_RECORDS_LOTE) {
      for (let i = 1; i < 10; i++) {
        result = await mercosService.ajustar_estoque_em_lote(lote);
        if ((await lib.tratarRetorno(result, 200)) == 200) break;
      }
      lote = [];
    }
  }

  if (lote.length > 0) {
    for (let i = 1; i < 10; i++) {
      result = await mercosService.ajustar_estoque_em_lote(lote);
      if ((await lib.tratarRetorno(result, 200)) == 200) break;
    }
    lote = [];
  }
}

async function enviarFotosEmLote() {
  const anuncio = new TAnuncio.MpkAnuncio(await TMongo.mongoConnect());
  const rows = await anuncio.findAll({
    status: TAnuncioTypes.anuncioTypes.pendente,
  });

  if (!rows) return;
  for (let row of rows) {
    let payload = {
      status: TAnuncioTypes.anuncioTypes.processado,
    };
    console.log(`Enviando imagem sku[${row?.sku}]`);
    try {
      await enviarImagensProdutoById(row?.id);
    } catch (error) {}
    //depois que enviar todas as imagens em lote nao precisa atualizar status
    //await anuncio.update(row?.id, payload);
  }
}

async function enviarImagensProdutoById(id_anuncio) {
  let anuncio = await getAnuncioB2bById(id_anuncio);
  let sku = anuncio?.sku ? anuncio?.sku : "";
  let id_storage = lib.config_id_storage();
  let mercos_produto_id = anuncio?.meuspedidosid;

  //imagem_url
  // const body = {
  //   produto_id: mercos_produto_id,
  //   imagem_url: `https://www.superempresarial.com.br/storage/${id_storage}/${sku}-1.jpg`,
  //   ordem: 1,
  // };

  //imagem_base64   # envia todas as imagens
  let rows = await fbImageByIdProduto(sku);
  if (!rows) return { message: "Nenhuma imagem encontrada" };
  let retorno = [];
  let lote = [];
  let num = 0;
  let result = null;
  for (let row of rows) {
    const body = {
      produto_id: mercos_produto_id,
      imagem_base64: row.imagem_base64,
      ordem: num++,
    };
    lote.push(body);
    retorno.push({ posicao: num, id_produto: row.id_produto });
  }

  for (let body of lote) {
    for (let i = 1; i < 10; i++) {
      result = await mercosService.imagens_produto(body);
      if ((await lib.tratarRetorno(result, 201)) == 201) break;
    }
  }

  return { ...retorno, status: result?.status, statusText: result?.statusText };
}

async function recebeAnunciosProcessado() {
  const anuncio = new TAnuncio.MpkAnuncio(await TMongo.mongoConnect());
  let processado = TAnuncioTypes.anuncioTypes.processado;
  let items = await anuncio.findAllByIds({ status: processado });
  console.log("Recebendo produtos processados", items?.length);

  if (!items) return;
  let lote = [];

  for (let item of items) {
    lote.push(item);
    if (lote.length < MAX_CMD_SQL) continue;
    try {
      await updateAnuncioSQL(lote);
      await updateEstoqueSQL(lote);
    } catch (error) {}
    lote = [];
  }

  try {
    await updateAnuncioSQL(lote);
    await updateEstoqueSQL(lote);
    lote = [];
  } catch (error) {}

  let concluido = TAnuncioTypes.anuncioTypes.concluido;
  await anuncio.updateMany({ status: processado }, { status: concluido });
}

async function enviarTodosAnunciosB2B() {
  LISTA_OF_CATEGORIAS = [];
  const anuncio = new TAnuncio.MpkAnuncio(await TMongo.mongoConnect());
  const rows = await anuncio.findAll({
    status: TAnuncioTypes.anuncioTypes.pendente,
  });

  if (!rows) return;
  for (let row of rows) {
    await setB2BAnuncio(row);
  }
}

async function getAnuncioB2bById(id_anuncio) {
  const anuncio = new TAnuncio.MpkAnuncio(await TMongo.mongoConnect());
  return await anuncio.findById(id_anuncio);
}

async function getAnuncio(id_anuncio) {
  const rows = await getAnuncios(0, 0, 99, 0, id_anuncio);
  return rows[0];
}

async function getAnuncios(
  id_integracao = 0,
  id_variacao = 0,
  id_flag = 99,
  id_produto = 0,
  id_anuncio = 0,
  filter = ""
) {
  let cmd_sql = `SELECT * FROM MPK_GETANUNCIO(?,?,?,?,?) ${filter}`;
  return await fb5.executeQuery(cmd_sql, [
    id_integracao,
    id_variacao,
    id_flag,
    id_produto,
    id_anuncio,
  ]);
}

async function enviarAnunciosPendente() {
  const id_integracao = lib.config_id_integracao();
  const rows = await getAnuncios(
    id_integracao,
    0,
    99,
    0,
    0,
    " WHERE STATUS=0 "
  );
  if (!rows || !Array.isArray(rows)) return;
  const anuncio = new TAnuncio.MpkAnuncio(await TMongo.mongoConnect());
  for (let row of rows) {
    await anuncio.update(row?.id, row); // Ganhar velocidade instanciando apenas 1 X
  }
}

async function setAnuncio(payload) {
  const anuncio = new TAnuncio.MpkAnuncio(await TMongo.mongoConnect());
  return await anuncio.update(payload?.id, payload);
}

async function getCategoriaB2B(id) {
  let result = 0;
  if (LISTA_OF_CATEGORIAS.length == 0) {
    const rows = await TCategoriaController.getCategorias();
    for (let row of rows) {
      LISTA_OF_CATEGORIAS.push(row);
    }
  }

  let items = LISTA_OF_CATEGORIAS;
  if (Array.isArray(items) && items.length > 0) {
    for (let item of items) {
      if (item?.id == id) {
        result = item?.id_ext;
        break;
      }
    }
  }

  return result;
}

async function addAnuncioB2BOne(id) {
  //Obter o anuncio local Banco de dados
  if (!id) return { status: 400, message: "Anuncio não encontrado" };
  let row = await getAnuncio(id);
  if (!row) return { status: 400, message: "Anuncio não encontrado" };

  //atualizo no mongodb  ... se o anuncio ainda nao tiver sido gravado
  await setAnuncio(row);

  //criar o anuncio no Mercos
  await setB2BAnuncio(row);

  //retorno a informacao completa que estiver no mongodb...
  await lib.sleep(200);
  let result = await getAnuncioB2bById(row?.id);

  //atualizo firebird com o id do Mercos
  try {
    await updateAnuncioSQL([result]);
  } catch (error) {}

  return result;
}

async function setB2BAnuncio(payload) {
  let meuspedidosid = 0;

  let obj = await getAnuncioB2bById(payload?.id);
  if (obj?.meuspedidosid && obj?.meuspedidosid > 0) {
    console.log("Anuncio já cadastrado no Mercos " + obj?.meuspedidosid);
    meuspedidosid = obj?.meuspedidosid;
  }

  //preciso guardar o id da categoria
  let result;
  let id_categoria = payload?.id_categoriaweb ? payload?.id_categoriaweb : 0;
  payload.id_categoriaweb = await getCategoriaB2B(id_categoria);

  //formatacao campos
  let detalhes_html = String(
    payload?.detalhes_html ? payload?.detalhes_html : ""
  );
  detalhes_html = detalhes_html.substring(0, 5000);
  payload.detalhes_html = detalhes_html;

  const body = TProdutoMappers.ProdutoMappers.toMercos(payload);
  if (body.categoria_id == 0) delete body.categoria_id;

  //teste para obter 429
  // for (let i = 1; i < 10; i++) {
  //   let r = await mercosService.getProdutos("");
  // }

  if (meuspedidosid > 0) {
    try {
      for (let i = 1; i < 10; i++) {
        result = await mercosService.updateProdutos(meuspedidosid, body);
        if ((await lib.tratarRetorno(result, 200)) == 200) break;
      }

      if (!result) return;
      let { status } = result;
      if (status == 200) {
        payload.id_categoriaweb = id_categoria;
        payload.status = TAnuncioTypes.anuncioTypes.processado;
        await setAnuncio(payload);
        console.log("produto atualizado no Mercos " + payload?.meuspedidosid);
      }
    } catch (error) {
      result = null;
    }
  } else
    try {
      for (let i = 1; i < 10; i++) {
        result = await mercosService.createProdutos(body);
        if ((await lib.tratarRetorno(result, 201)) == 201) break;
      }

      if (!result) return;
      let { headers, status } = result;
      if (status == 201) {
        payload.id_categoriaweb = id_categoria;
        payload.meuspedidosid = Number(headers["meuspedidosid"]);
        payload.status = TAnuncioTypes.anuncioTypes.processado;
        let m = payload?.meuspedidosid + " " + lib.currentDateTimeStr();
        await setAnuncio(payload);
        console.log("produto cadastrado no Mercos " + m);
      }
    } catch (error) {
      result = null;
    }
}
async function getAnuncioB2B(numero_dias = 0) {
  let alterado_apos = lib.getAlterado_apos(numero_dias, "00:00:00");
  let result = null;
  let eof = 1;
  let lote = [];
  while (eof > 0) {
    result = await mercosService.getProdutos(alterado_apos);
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

//routes
const doAddAnuncioB2BOne = async (req, res) => {
  try {
    res.send(await addAnuncioB2BOne(req.params.id));
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const doEnviarImagensProdutoById = async (req, res) => {
  try {
    res.send(await enviarImagensProdutoById(req.params.id));
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const doGetAnuncioB2B = async (req, res) => {
  console.log(req.query);
  let num_dias = Number(req.query.num_dias ? req.query.num_dias : 0);
  try {
    res.send(await getAnuncioB2B(num_dias));
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

module.exports = {
  init,
  doAddAnuncioB2BOne,
  doGetAnuncioB2B,
  doEnviarImagensProdutoById,
  getAnuncioB2B,
};
