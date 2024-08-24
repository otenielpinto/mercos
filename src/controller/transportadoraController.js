const lib = require("../utils/lib");
const fb5 = require("../infra/fb5");
const mercosService = require("../services/mercosService");

const newTransportadora = {
  nome: "Motoboy",
  cidade: "Sapiranga",
  estado: "RS",
  informacoes_adicionais: "",
  excluido: false,
};

async function init() {
  //obter transportadora

  let result;
  let id;

  console.log("Obtendo as transportadoras");
  await lib.sleep(1000 * 10);

  result = await mercosService.getTransportadoras();
  for (let row of result?.data) {
    console.log("obter transportadora:" + JSON.stringify(row));
  }
  //console.log(rows);
  if (result.status == 429) {
    console.log("Limite de consultas por minuto atingido", result.statusText);
    await lib.sleep(1000 * 10);
  }

  //obter transportadora especifica

  //incluir transportadora
  //   await lib.sleep(1000 * 6);
  //   console.log("Aguardando 5 segundos para incluir a transportadora");
  //   result = await mercosService.createTransportadoras(newTransportadora);
  //   if (result.status == 201) {
  //     console.log(result.response);
  //   }
  //   console.log(result.response);

  //alterar transportadora
  id = 435853;
  await lib.sleep(1000 * 6);
  console.log("Aguardando 5 segundos para alterar a transportadora");
  result = await mercosService.updateTransportadoras(id, newTransportadora);
  if (result.status == 200) {
    console.log("Registro foi alterado com sucesso");
  } else console.log(result);
}

module.exports = {
  init,
};
