const lib = require("../utils/lib");
const mercosService = require("../services/mercosService");

async function newCliente() {
  let row = {
    razao_social: "VRACING ESPECIALISTA EM MOTO PECAS LTDA ME ",
    nome_fantasia: "VRACING",
    tipo: "J",
    cnpj: "08418431000184",
    inscricao_estadual: "0190099216",
    suframa: "",
    rua: "AV BRASIL",
    numero: "502",
    complemento: "1 ANDAR",
    bairro: "IMIGRANTE",
    cep: "93700000",
    cidade: "CAMPO BOM",
    estado: "RS",
    observacao: "",
    emails: [
      {
        email: "vracing@gmail.com",
      },
    ],
    telefones: [
      {
        numero: "(51)3598-9398 ",
      },
    ],
    contatos: [
      {
        nome: "Valmor",
        cargo: "Ceo",
        emails: [
          {
            email: "contato@vracing.com.br",
          },
        ],
        telefones: [
          {
            numero: "(51) 3598-9398",
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

async function newCondicoesPagamento() {
  let row = {
    nome: "Avista",
    valor_minimo: 0,
    excluido: false,
  };
  return row;
}

async function newTabelaPreco() {
  let row = {
    nome: "Tabela preço livre",
    tipo: "P",
    acrescimo: null,
    desconto: 0,
    excluido: false,
  };

  return row;
}

async function newTabelaPrecoPorLote() {
  let rows = [
    {
      id: 001,
      tabela_id: 1,
      produto_id: 19071196,
      preco: 80.0,
    },

    {
      id: 002,
      tabela_id: 1,
      produto_id: 19074582,
      preco: 25.0,
    },
  ];

  return rows;
}

async function init() {
  let result;
  let id;

  // await lib.sleep(1000 * 3);
  // let tabelaPrecoPorLote = await newTabelaPrecoPorLote();
  // result = await mercosService.produtos_tabela_preco_em_lote(
  //   tabelaPrecoPorLote
  // );
  // console.log(result.response.data);

  // let tabelaPreco = await newTabelaPreco();
  // result = await mercosService.createTabelasPreco(tabelaPreco);
  // console.log(result.response);

  // let tabelaPrecos = await mercosService.getTabelasPreco(null);
  // console.log(tabelaPrecos);
  // for (let tabelapreco of tabelaPrecos?.data) {
  //   console.log(tabelapreco);
  // }

  //   let condPagamento = await newCondicoesPagamento();
  //   result = await mercosService.createCondicoes_pagamento(condPagamento);
  //   console.log(result.response);

  // let condPagamentos = await mercosService.getCondicoes_pagamento(null);
  // for (let condPagamento of condPagamentos?.data) {
  //   console.log(condPagamento);
  // }

  //id = 230245
  //   result = await mercosService.updateCondicoes_pagamento(id, condPagamento);

  // let cliente = await newCliente();
  // cliente.razao_social = "VRACING ESPECIALISTA EM MOTO PECAS LTDA ME";
  // await lib.sleep(1000 * 5);
  // result = await mercosService.createClientes(cliente);
  // // console.log(result.response.data);
  // //console.log(result?.response.headers?.meuspedidosid);
  // //console.log(JSON.stringify(result?.data));

  // await lib.sleep(1000 * 6);
  // id = 8109853;
  // cliente.razao_social = "XVRACING ESPECIALISTA EM MOTO PECAS LTDA ME";
  // result = await mercosService.updateClientes(id, cliente);
  // console.log(result);
}

module.exports = {
  init,
};
