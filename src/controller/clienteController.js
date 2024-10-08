const lib = require("../utils/lib");
const fb5 = require("../infra/fb5");
const mercosService = require("../services/mercosService");

async function newCliente() {
  let row = {
    razao_social: "MERCOS",
    nome_fantasia: "MERCOS",
    tipo: "J",
    cnpj: "00000006000001",
    inscricao_estadual: "0000000000",
    suframa: "",
    rua: "AV BRASIL",
    numero: "0",
    complemento: "1 ANDAR",
    bairro: "IMIGRANTE",
    cep: "93700000",
    cidade: "CAMPO BOM",
    estado: "RS",
    observacao: "",
    emails: [
      {
        email: "thepowerofwordsg@gmail.com",
      },
    ],
    telefones: [
      {
        numero: "(51)3090-0008 ",
      },
    ],
    contatos: [
      {
        nome: "Masteer",
        cargo: "Ceo",
        emails: [
          {
            email: "contato@gmail.com.br",
          },
        ],
        telefones: [
          {
            numero: "(51) 3000-0098",
          },
        ],
      },
    ],
    enderecos_adicionais: [],
    nome_excecao_fiscal: "Isento",
    excluido: false,
    //segmento_id: 0,
    //    bloqueado: false,
    //    motivo_bloqueio_id: 1,
    extras: [],
  };

  return row;
}

async function createCliente() {
  let cliente = await newCliente();
  let result;
  cliente.razao_social = "bbf9326da1764886";
  cliente.cnpj = "00000006000001";
  cliente.tipo = "J";
  await lib.sleep(1000 * 6);
  result = await mercosService.createClientes(cliente);
  console.log(result);
}

async function updateCliente() {
  // console.log(result);
  // await lib.sleep(1000 * 6);
  // let cliente = await newCliente();
  // cliente.razao_social = "9d54a6ae20a04ac3";
  // cliente.nome_fantasia = "6852695b8ea84e7b";
  // cliente.cnpj = "00000006000001";
  // cliente.excluido = true;
  // id = 8114872;
  // result = await mercosService.updateClientes(id, cliente);
  // console.log(result);
}

async function getClientes() {
  let result;
  let id;
  let alterado_apos;

  alterado_apos = lib.getAlterado_apos(0, null);
  let meuspedidos_requisicoes_extras = null;
  let lote = [];
  result = null;
  let eof = 0;
  while (eof < 10000) {
    await lib.sleep(1000 * 6);

    result = await mercosService.getClientes(alterado_apos);
    if (result?.data?.limite_de_requisicoes) {
      let tempo_ate_permitir_novamente = Number(
        result?.data?.tempo_ate_permitir_novamente + 1
      );
      console.log(tempo_ate_permitir_novamente + " segundos");
      await lib.sleep(6000 * tempo_ate_permitir_novamente);
      continue;
    }

    if (result?.data) {
      let rows = result?.data;
      for (let row of rows) {
        alterado_apos = `alterado_apos=${row.ultima_alteracao}`;
        lote.push(row);
      }
    }

    meuspedidos_requisicoes_extras = Number(
      result?.headers?.meuspedidos_requisicoes_extras
        ? result?.headers?.meuspedidos_requisicoes_extras
        : 0
    );
    console.log(meuspedidos_requisicoes_extras);
    if (meuspedidos_requisicoes_extras == 0) break;
  }
  console.log(lote);
}

async function init() {
  //await createCliente();
}

module.exports = {
  init,
};
