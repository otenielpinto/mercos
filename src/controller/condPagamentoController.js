const lib = require("../utils/lib");
const fb5 = require("../infra/fb5");
const mercosService = require("../services/mercosService");
const systemService = require("../services/systemService");
const {
  CondPagamentoRepository,
} = require("../repository/condPagamentoRepository");
const TMongo = require("../infra/mongoClient");

async function init() {
  if ((await systemService.started(1, "cond_pagamento")) == 1) return;
  await importarCondPagamento();
}

async function importarCondPagamento() {
  const c = await TMongo.mongoConnect();
  let condPagamentoRepository = new CondPagamentoRepository(c);
  let lote = [];
  let alterado_apos = null;
  let result = null;

  for (let i = 1; i < 10; i++) {
    result = await mercosService.getCondicoes_pagamento(alterado_apos);
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
    let payload = {
      ...item,
      codigo_erp: "",
    };
    await condPagamentoRepository.update(item.id, payload);
  }
}

module.exports = {
  init,
};
