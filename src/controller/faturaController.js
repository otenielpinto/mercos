const lib = require("../utils/lib");
const fb5 = require("../infra/fb5");
const mercosService = require("../services/mercosService");
const { FaturaRepository } = require("../repository/faturaRepository");
const systemService = require("../services/systemService");
const TMongo = require("../infra/mongoClient");
const pedidoController = require("../controller/pedidoController");

//await alterarFaturamento();
async function enviarFaturaPorHora() {
  const hora = new Date().getHours();
  const key = "enviar_fatura_por_hora_" + hora;
  if ((await systemService.started(1, key)) == 1) return 1;
}

async function init() {
  if ((await enviarFaturaPorHora()) == 1) return;

  await createFaturaSQL();
  await enviarFaturaB2B();
}

async function createFaturaSQL() {
  let num_dias = 7;
  if (systemService.started(1, "enviar_fatura_b2b") == 1) num_dias = 1;

  let rows = await pedidoController.obterPedidosFaturadosSQL(num_dias);
  if (!rows) return;

  let fatura = new FaturaRepository(await TMongo.mongoConnect());
  for (let row of rows) {
    fatura.create(row);
  }
}

async function enviarFaturaB2B() {
  let fatura = new FaturaRepository(await TMongo.mongoConnect());
  let filter = { sys_status: 0 };
  let rows = await fatura.findAll(filter);
  let dtExcluir = lib.addDays(new Date(), -7);

  for (let row of rows) {
    if (row.dtmovto < dtExcluir) {
      await fatura.delete(row.id);
      continue;
    }

    let obs = "Pedido numero " + row?.id;
    let id_faturamento = await faturarPedido(row.id_pedido, row.valor, obs);
    //console.log("obtendo retorno : " + id_faturamento + " " + row.id);

    if (id_faturamento) {
      let update = { id_faturamento: id_faturamento, sys_status: 1 };
      await fatura.update(row.id, update);
    }
  }
}

async function newFaturarPedido(numero_pedido) {
  return {
    pedido_id: Number(numero_pedido),
    valor_faturado: 200,
    data_faturamento: "2024-08-21",
    numero_nf: "0000",
    informacoes_adicionais: "emitido nfe",
  };
}

async function alterarFaturamento(faturamento_id, pedido_id, valor) {
  let body = {
    pedido_id: pedido_id,
    valor_faturado: valor,
    data_faturamento: "2024-08-30",
    numero_nf: faturamento_id,
    informacoes_adicionais: "homologando mercos api ...",
    excluido: false,
  };

  await lib.sleep(1000 * 10);
  let result = await mercosService.alterarFaturamento(faturamento_id, body);
  console.log(result);
  //console.log(result.response.data.erros);
}

async function faturarPedido(pedido_id, valor, obs = "") {
  let data_faturamento = lib.formatDate(new Date(), "yyyy-MM-dd");

  let body = {
    pedido_id: pedido_id,
    //    cliente_id: 8125218,
    valor_faturado: valor,
    data_faturamento: data_faturamento,
    //"numero_nf": "2134",
    informacoes_adicionais: obs,
  };

  let faturamento_id = null;
  let t = 0;
  while (t++ < 2) {
    let result = await mercosService.faturarPedido(body);
    if ((await lib.tratarRetorno(result, 201)) == 201) {
      faturamento_id = result?.headers?.meuspedidosid;
      break;
    }
  }
  return faturamento_id;
}

module.exports = {
  init,
};
