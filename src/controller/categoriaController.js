const TCategoria = require("../repository/categoriaRepository");
const TMongo = require("../infra/mongoClient");
const fb5 = require("../infra/fb5");
const lib = require("../utils/lib");
const mercosService = require("../services/mercosService");
const CategoriaMappers = require("../mappers/categoriaMappers");

async function init() {
  await setCategorias();
  try {
    await getB2bCategorias();
  } finally {
    await setB2bCategorias();
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

async function getB2bCategorias() {
  const categoria = new TCategoria.CategoriaRepository(
    await TMongo.mongoConnect()
  );

  //busco categorias do mercos
  let result = null;
  try {
    for (let i = 1; i < 10; i++) {
      result = await mercosService.getCategorias(null);
      if (result?.status == 200) break;
      await lib.sleep(1000 * i);
    }
    if (!result) return;
    let { data: items } = result;
    for (let item of items) {
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
}

async function setB2bCategorias() {
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
        result = await mercosService.createCategorias(JSON.stringify(payload));
        if (result?.status == 201) break;
        await lib.sleep(1000 * i);
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
  console.log("Sincronizando todas as categorias");
  await setCategorias();
  try {
    await getB2bCategorias();
  } finally {
    await setB2bCategorias();
  }
  return getCategorias();
}

module.exports = {
  init,
  doCreate,
  getCategorias,
};
