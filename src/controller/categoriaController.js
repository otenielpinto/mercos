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
  try {
    console.log("Aguardando 10 segundos " + lib.currentDateTimeStr());
    await lib.sleep(1000 * 10);
    let { data: items } = await mercosService.getCategorias(null);
    for (let item of items) {
      console.log("Validando categorias ->" + item?.nome);

      if (item.excluido == true) continue;
      let obj = await categoria.findByDescricao(item?.nome);
      if (!obj) continue;

      if (obj?.id_ext <= 0 || obj?.id_ext != item?.id) {
        obj.id_ext = item?.id;
        obj.sync = 1;
        await categoria.update(obj?.id, obj);
        await lib.sleep(1000 * 3);
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

  let items = await categoria.findAll();
  if (!Array.isArray(items)) return;

  for (let item of items) {
    let payload = CategoriaMappers.CategoriaMappers.toMercos(item);

    if (payload?.id === 0) {
      delete payload?.id;
      let result = await mercosService.createCategorias(
        JSON.stringify(payload)
      );
      if (!result) continue;
      let { headers, status } = result;
      await lib.sleep(1000 * 10);
      if (status == 201) {
        item.id_ext = Number(headers["meuspedidosid"]);
        item.sync = 1;
        await categoria.update(item?.id, item);
      }
    }
  }
}

module.exports = {
  init,
  getCategorias,
};
