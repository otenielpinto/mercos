const lib = require("../utils/lib");
const fb5 = require("../infra/fb5");
const mercosService = require("../services/mercosService");

async function getAlterado_apos(numero_dias) {
  let date = new Date();
  date.setDate(date.getDate() + numero_dias);
  return lib.formatDate(date, "yyyy-MM-dd HH:mm:ss");
}

async function init() {
  await recebePedidosB2B();
}

async function recebePedidosB2B() {
  await lib.sleep(1000 * 6);
  let alterado_apos = await getAlterado_apos(-1);
  console.log("Obtendo pedidos a partir de: " + alterado_apos);
  let result = await mercosService.getPedidos(alterado_apos);
  if (result.status == 200) {
    let pedidos = result.data;
    for (let pedido of pedidos) {
      console.log(pedido);
    }
  }
  //console.log(result);
}

async function pedidoCancelar(id) {
  let result = await mercosService.pedidoCancelar(id);
  if (result.status == 200) {
    console.log("Cancelado com sucesso");
  }
  //console.log(result);
}

module.exports = {
  init,
};
