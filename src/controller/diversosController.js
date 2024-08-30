const lib = require("../utils/lib");
const mercosService = require("../services/mercosService");

async function newCondicoesPagamento() {
  let row = {
    nome: "a vista",
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

async function newTabelaPrecoPorCliente(id_cliente) {
  return {
    cliente_id: id_cliente,
    tabelas_liberadas: [12, 14, 27],
  };
}

async function newPromocoes(id_produto, valor_desconto, nome, slug) {
  let obj = {
    nome: nome,
    data_inicial: "2024-08-26",
    data_final: "2024-12-31",
    regras: [
      {
        produto_id: id_produto,
        desconto: valor_desconto,
      },
    ],
  };
  if (slug) obj.slug = slug;
  return obj;
}

async function init() {
  let result;
  let id;
  let alterado_apos;
  // //************************************************************************ */
  // //criar tabela de precos
  // //************************************************************************ */
  // let data = [
  //   {
  //     tabela_id: 216408,
  //     preco: 101.36,
  //     produto_id: 19090609,
  //   },
  //   {
  //     id: 6218409,
  //     tabela_id: 216408,
  //     preco: 101.36,
  //     produto_id: 19090610,
  //   },
  // ];

  // result = await mercosService.produtos_tabela_preco_em_lote(data);
  // console.log(result);

  //************************************************************************ */
  //Promocao   codigo produto   11623    id_produto = 19070696
  // console.log("Enviando promocoes ....");
  // let promocao = await newPromocoes(
  //   19079524,
  //   11,
  //   "2efda2e0ea594c31",
  //   "bc3a93527348445c"
  // );
  // result = await mercosService.createPromocoes(promocao);
  // console.log(result);

  // // await lib.sleep(1000 * 6);
  // alterado_apos = lib.getAlterado_apos(0, "07:00:00");
  // let lote = [];
  // for (let i = 1; i < 10; i++) {
  //   await lib.sleep(1000 * 6);
  //   result = await mercosService.getPromocoes(alterado_apos);
  //   if (result?.status != 200) {
  //     continue;
  //   }

  //   for (let row of result?.data) {
  //     alterado_apos = `alterado_apos=${row.ultima_alteracao}`;
  //     lote.push(row);
  //   }

  //   meuspedidos_requisicoes_extras = Number(
  //     result?.headers?.meuspedidos_requisicoes_extras
  //       ? result?.headers?.meuspedidos_requisicoes_extras
  //       : 0
  //   );

  //   if (meuspedidos_requisicoes_extras == 0) break;
  // }

  // console.log(lote);

  // let promocao = await newPromocoes(
  //   19079524,
  //   11,
  //   "e19e2037f7084334",
  //   "bc3a93527348445c"
  // );

  // result = await mercosService.updatePromocoes(97828, promocao);
  // console.log(result);

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
  // console.log(result);

  // let tabelaPreco = await newTabelaPreco();
  // tabelaPreco.tipo = "P";
  // tabelaPreco.nome = "4161cec331504c62"; //216407
  // result = await mercosService.createTabelasPreco(tabelaPreco);

  // let tabelaPreco = await newTabelaPreco();
  // tabelaPreco.tipo = "P";
  // tabelaPreco.nome = "4e27d707966c4148"; //216408
  // result = await mercosService.createTabelasPreco(tabelaPreco);

  //result = await mercosService.updateTabelasPreco(216406, tabelaPreco);
  //console.log(result);

  // let tabelaPrecos = await mercosService.getTabelasPreco(null);
  // console.log(tabelaPrecos);
  // for (let tabelapreco of tabelaPrecos?.data) {
  //   console.log(tabelapreco);
  // }

  // let condPagamento = await newCondicoesPagamento();
  // condPagamento.nome = "0dd44a948cb24c4e";
  // result = await mercosService.createCondicoes_pagamento(condPagamento);
  // console.log(result);

  //alterado_apos = lib.getAlterado_apos(-1, null);

  // let lote = [];
  // alterado_apos = "alterado_apos=2024-08-01 12:00:00";
  // let meuspedidos_qtde_total_registros = 0;

  // console.log("Obtendo condicoes a partir de: " + alterado_apos);
  // for (let i = 0; i < 10; i++) {
  //   await lib.sleep(1000 * 6);
  //   result = await mercosService.getCondicoes_pagamento(alterado_apos);
  //   for (let row of result?.data) {
  //     alterado_apos = `alterado_apos=${row?.ultima_alteracao}`;
  //     lote.push(row);
  //   }
  //   if (result?.data?.length == 0) break;
  // }
  // console.log(lote);

  // let condPagamento = await newCondicoesPagamento();
  // condPagamento.nome = "a vista";
  // id = 230370;
  // result = await mercosService.updateCondicoes_pagamento(id, condPagamento);

  // let categoria_cliente = {
  //   "nome": "Nova categoria",
  //   "excluido": false
  // }
  // result = await mercosService.createCategorias(categoria_cliente);
  // console.log(result?.data);
  // console.log(result?.headers);
}

module.exports = {
  init,
};
