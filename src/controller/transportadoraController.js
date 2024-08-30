const lib = require("../utils/lib");
const fb5 = require("../infra/fb5");
const mercosService = require("../services/mercosService");

const newTransportadora = {
  nome: "0ed2eecff6e24374",
  cidade: "Sapiranga",
  estado: "RS",
  informacoes_adicionais: "",
  excluido: false,
};

async function init() {}

async function getTransportadoras() {
  //obter transportadora

  let result;
  let id;

  // result = await mercosService.getTransportadoras();
  // for (let row of result?.data) {
  //   console.log("obter transportadora:" + JSON.stringify(row));
  // }
  //console.log(rows);
  // if (result.status == 429) {
  //   console.log("Limite de consultas por minuto atingido", result.statusText);
  //   await lib.sleep(1000 * 10);
  // }
}

async function updateTransportadora(id, payload) {
  let result;
  // //alterar transportadora
  // id = 435885;
  // await lib.sleep(1000 * 6);
  // console.log("Aguardando 5 segundos para alterar a transportadora");
  // result = await mercosService.updateTransportadoras(id, newTransportadora);
  // if (result?.status == 200) {
  //   console.log("Registro foi alterado com sucesso");
  // } else console.log(result);
}

async function incluirTransportadora() {
  // // incluir transportadora
  // await lib.sleep(1000 * 6);
  // result = await mercosService.createTransportadoras(newTransportadora);
  // console.log(result);
}

module.exports = {
  init,
};
