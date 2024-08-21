const TMongo = require("../infra/mongoClient");
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

async function init() {
  //modulo client
  if (lib.config_modulo_client() == 1) {
    await enviarEstoque();
    await enviarAnunciosPendente();
    await recebeAnunciosProcessado();
  }

  //modulo servidor
  if (lib.config_modulo_server() == 1) {
    await ajustar_estoque_em_lote();
    await enviarTodosAnunciosB2B();
  }
}

async function ajustar_estoque_em_lote() {
  const anuncio = new TAnuncio.MpkAnuncio(await TMongo.mongoConnect());
  const rows = await anuncio.findAll({
    status: TAnuncioTypes.anuncioTypes.pendente,
  });

  let lote = [];
  for (let row of rows) {
    if (!row?.meuspedidosid) continue;
    let obj = { produto_id: row?.meuspedidosid, novo_saldo: row?.estoque };
    lote.push(obj);

    if (lote.length >= MAX_RECORDS_LOTE) {
      let result = await mercosService.ajustar_estoque_em_lote(lote);
      console.log(result);
      lote = [];
    }
  }

  if (lote.length > 0) {
    let result = await mercosService.ajustar_estoque_em_lote(lote);
    lote = [];
  }
}

async function enviarEstoque() {
  let id_integracao = await lib.config_id_marketplace();
  let id_variacao = 0;
  let id_flag = 99;
  let id_produto = 0;
  let id_anuncio = 0;
  let fields = `ID,PRECO,PRECO_PROMOCIONAL,ESTOQUE,SKU`;
  let cmd_sql = `SELECT ${fields} FROM MPK_GETANUNCIO(?,?,?,?,?) WHERE STATUS=0 `;

  let rows = await fb5.executeQuery(cmd_sql, [
    id_integracao,
    id_variacao,
    id_flag,
    id_produto,
    id_anuncio,
  ]);
  if (!rows) return;

  const anuncio = new TAnuncio.MpkAnuncio(await TMongo.mongoConnect());
  try {
    anuncio.updateEstoqueMany(rows);
  } catch (error) {}
}

async function updateAnuncioSQL(items) {
  if (!items) return;
  if (items?.length == 0) return;
  let cmd_sql = "";
  let processado = 1; //processado
  for (let item of items) {
    cmd_sql += `UPDATE MPK_ANUNCIO SET STATUS=${processado}, ID_ANUNCIO_MKTPLACE=${item?.meuspedidosid} WHERE ID=${item?.id} ;\n`;
  }

  let execute_block_sql = `EXECUTE BLOCK
    AS
    BEGIN 
      ${cmd_sql}
    END
  `;

  fb5.firebird.attach(fb5.dboptions, (err, db) => {
    if (err) {
      console.log(err);
      return;
    }
    db.query(execute_block_sql, [], (err, result) => {
      db.detach();
      if (err) {
        console.log(err);
      }
    });
  }); // fb5.firebird
}

async function recebeAnunciosProcessado() {
  const anuncio = new TAnuncio.MpkAnuncio(await TMongo.mongoConnect());
  let processado = TAnuncioTypes.anuncioTypes.processado;
  let items = await anuncio.findAllByIds({ status: processado });
  if (!items) return;
  let produtos = [];

  let records = 0;
  for (let item of items) {
    records++;
    produtos.push(item);
    if (records < MAX_CMD_SQL) continue;
    try {
      await updateAnuncioSQL(produtos);
    } catch (error) {}
    produtos = [];
    records = 0;
  }

  try {
    await updateAnuncioSQL(produtos);
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
  const id_integracao = await lib.config_id_marketplace();
  const rows = await getAnuncios(
    id_integracao,
    0,
    99,
    0,
    0,
    " WHERE STATUS=0 "
  );
  if (!rows) return;
  for (let row of rows) {
    await setAnuncio(row);
  }
}

async function setAnuncio(payload) {
  const anuncio = new TAnuncio.MpkAnuncio(await TMongo.mongoConnect());
  const result = await anuncio.update(payload?.id, payload);
  return result;
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
  let detalhes_html = payload?.detalhes_html ? payload?.detalhes_html : "";
  detalhes_html = detalhes_html.substring(0, 5000);
  payload.detalhes_html = detalhes_html;

  const body = TProdutoMappers.ProdutoMappers.toMercos(payload);
  if (body.categoria_id == 0) delete body.categoria_id;

  if (meuspedidosid > 0) {
    try {
      result = await mercosService.updateProdutos(meuspedidosid, body);
      if (!result) return;
      let { headers, status } = result;

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
      result = await mercosService.createProdutos(body);
      if (!result) return;
      let { headers, status } = result;
      if (status == 201) {
        payload.id_categoriaweb = id_categoria;
        payload.meuspedidosid = Number(headers["meuspedidosid"]);
        payload.status = TAnuncioTypes.anuncioTypes.processado;
        await setAnuncio(payload);
        console.log("produto cadastrado no Mercos " + payload?.meuspedidosid);
      }
    } catch (error) {
      result = null;
    }
}

module.exports = {
  init,
};
