const TCategoria = require("../repository/categoriaRepository");
const TMongo = require("../infra/mongoClient");
const fb5 = require("../infra/fb5");
const lib = require("../utils/lib");
const mercosService = require("../services/mercosService");
const CategoriaMappers = require("../mappers/categoriaMappers");
const systemService = require("../services/systemService");

async function init() {
  if ((await systemService.started(1, "categoria_produto")) == 1) return;

  await setCategorias();
  try {
    await getCategoriasB2B();
  } finally {
    await setCategoriasB2B();
  }
  return getCategorias();
}

//public

async function getCategorias() {
  const categoria = new TCategoria.CategoriaRepository(
    await TMongo.mongoConnect()
  );

  return await categoria.findAll();
}

async function setCategorias() {
  let rows = await fb5.openQuery("WCATEGORY", "*", "1=1", []);
  if (!rows) return;

  const categoria = new TCategoria.CategoriaRepository(
    await TMongo.mongoConnect()
  );

  for (let row of rows) {
    await categoria.create(row);
  }
}

async function getCategoriasB2B() {
  const categoria = new TCategoria.CategoriaRepository(
    await TMongo.mongoConnect()
  );

  //busco categorias do mercos
  let result = null;
  let lote = [];
  let alterado_apos = null;
  try {
    for (let i = 1; i < 10; i++) {
      result = await mercosService.getCategorias(alterado_apos);
      await lib.tratarRetorno(result, 200);
      if (result?.status == 200) {
        let { data: items } = result;
        if (!Array.isArray(items)) items = [];
        if (items.length == 0) break;
        for (let item of items) {
          alterado_apos = `alterado_apos=${item.ultima_alteracao}`;
          lote.push(item);
        }
      }
    }

    for (let item of lote) {
      if (item.excluido == true) continue;
      let obj = await categoria.findByDescricao(item?.nome);
      if (!obj) continue;

      if (obj?.id_ext <= 0 || obj?.id_ext != item?.id) {
        obj.id_ext = item?.id;
        obj.sync = 1;
        await categoria.update(obj?.id, obj);
      }
    }
  } catch (error) {
    return;
  }
  return lote;
}

async function setCategoriasB2B() {
  const categoria = new TCategoria.CategoriaRepository(
    await TMongo.mongoConnect()
  );

  let result = null;
  let items = await categoria.findAll();
  if (!Array.isArray(items)) return;

  for (let item of items) {
    let payload = CategoriaMappers.CategoriaMappers.toMercos(item);
    result = null;
    if (payload?.id === 0) {
      delete payload?.id;
      for (let i = 1; i < 10; i++) {
        result = await mercosService.createCategorias(payload);
        await lib.tratarRetorno(result, 201);
        if (result?.status == 201) break;
      }
      if (!result) continue;
      let { headers, status } = result;
      if (status == 201) {
        item.id_ext = Number(headers["meuspedidosid"]);
        item.sync = 1;
        await categoria.update(item?.id, item);
      }
    }
  }
}

async function doCreate() {
  //a diferenca que nao faz teste algum se , já executou no dia
  //console.log("Sincronizando todas as categorias");
  await setCategorias();
  try {
    await getCategoriasB2B();
  } finally {
    await setCategoriasB2B();
  }
  return getCategorias();
}

const doGetCategoriasB2B = async (req, res) => {
  try {
    res.send(await getCategoriasB2B());
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

module.exports = {
  init,
  doCreate,
  doGetCategoriasB2B,
  getCategorias,
};
