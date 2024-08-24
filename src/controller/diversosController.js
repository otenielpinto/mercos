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

async function newClientes_condicoes_pagamento() {
  return {
    cliente_id: 8109853,
    condicoes_pagamento_liberadas: [230245, 230239],
  };
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

async function newTabelaPrecoPorCliente(id_cliente) {
  return {
    cliente_id: id_cliente,
    tabelas_liberadas: [12, 14, 27],
  };
}

async function newPromocoes(id_produto, valor_desconto) {
  //  slug: "",

  return {
    nome: `Promocao ${id_produto}`,
    data_inicial: "2024-08-01",
    data_final: "2024-08-30",
    regras: [
      {
        produto_id: id_produto,
        desconto: valor_desconto,
      },
    ],
  };
}

async function init() {
  let result;
  let id;
  await lib.sleep(1000 * 3);
  return;

  //************************************************************************ */
  //Promocao   codigo produto   11623    id_produto = 19070696
  // console.log("Enviando promocoes ....");
  // let promocao = await newPromocoes(19070696, 7.97);
  // result = await mercosService.createPromocoes(promocao);
  // if (result.status == 201) {
  //   console.log("Promocao criada com sucesso");
  // } else {
  //   console.log(result);
  //   console.log(JSON.stringify(result.response.data));
  //   return;
  // }

  await lib.sleep(1000 * 6);
  let rows = await mercosService.getPromocoes();
  if (rows.length > 0) {
    for (let row of rows) {
      console.log("Mostrando promoções :" + row);
    }
  }

  //************************************************************************ */
  //Tabelas de Preço por Cliente
  // let tabela_preco_cliente = await newTabelaPrecoPorCliente(8109853);
  // result = await mercosService.clientes_tabela_preco(tabela_preco_cliente);
  // if (result.status == 201) {
  //   console.log("Vincular cliente a tabela de preço", "criado com sucesso");
  // } else console.log(result);

  // //ok
  // result = await mercosService.clientes_tabela_preco_liberar_todas({
  //   cliente_id: 8109853,
  // });
  // if (result?.status == 200) {
  //   console.log(
  //     "clientes_tabela_preco_liberar_todas",
  //     "libera todas as tabelas com sucesso"
  //   );
  // } else console.log(result);

  //************************************************************************ */
  //Faturamento de Pedido
  // let id_faturamento = 19071196;
  // let faturamento = await newFaturarPedido(id_faturamento);
  // result = await mercosService.faturarPedido(faturamento);
  // if (result.status == 201) {
  //   console.log("faturamento", "faturamento realizado com sucesso");
  // } else console.log(result);

  //alterar faturamento
  // let alterarFaturamento = await newFaturarPedido(id_faturamento);
  // alterarFaturamento.data_faturamento = "2024-08-01";
  // alterarFaturamento.informacoes_adicionais = "faturamento alterado por teste";
  // result = await mercosService.alterarFaturamento(
  //   id_faturamento,
  //   alterarFaturamento
  // );
  // if (result.status == 201) {
  //   console.log("alterarFaturamento", "alterado com sucesso");
  // } else console.log(result);

  /************************************************************************ */
  // Criar condicoes de pagamento por clientes
  // let clientes_condicoes_pagamento = await newClientes_condicoes_pagamento();
  // result = await mercosService.createClientes_condicoes_pagamento(
  //   clientes_condicoes_pagamento
  // );
  // if (result.status == 200) {
  //   console.log(
  //     "clientes_condicoes_pagamento",
  //     "vinculacao realizada com sucesso"
  //   );
  // } else console.log(result);

  // let liberar_todas =
  //   await mercosService.updateClientes_condicoes_pagamento_liberar_todas({
  //     cliente_id: 8109853,
  //   });
  // if (liberar_todas.status == 200) {
  //   console.log("liberar_todas", "liberado com sucesso");
  // } else {
  //   console.log(liberar_todas);
  // }
  //************************************************************************ */

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
