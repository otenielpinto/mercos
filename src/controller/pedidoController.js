const lib = require("../utils/lib");
const fb5 = require("../infra/fb5");
const mercosService = require("../services/mercosService");
const { PedidoRepository } = require("../repository/pedidoRepository");
const TMongo = require("../infra/mongoClient");
const { pedidoTypes, pedidoStatus } = require("../types/pedidoTypes");
const systemService = require("../services/systemService");

const {
  CondPagamentoRepository,
} = require("../repository/condPagamentoRepository");

const LISTA_COND_PAGAMENTO = [];

async function init() {
  await recebePedidosB2BHoje();
  await recebePedidosB2BUltimosDias();
  await createPedidoSQL();

  //implementar assim que possivel
  //await createPedidosB2B();
  //await pedidoCancelar(2054471);
}

async function pedidoJaCadastrado(id_pedido, id_marketplace) {
  let cmd_sql = `
    SELECT FIRST 1 p.id
    FROM pedido_marketplace p
    WHERE p.id_pedido = ${id_pedido} AND p.idmarketplace = ${id_marketplace}
  `;
  let result = await fb5.executeQuery(cmd_sql, []);
  return result[0];
}

async function obterPedidosFaturadosSQL(num_dias) {
  let config_id_marketplace = lib.config_id_marketplace();
  if (!num_dias) num_dias = 7;

  let cmd_sql = `SELECT 
  M.ID, 
  M.NUMERO,
  M.ID_PEDIDO ,
  M.IDMARKETPLACE,
  M.DTMOVTO , 
  M.DT_FATURA, 
  P.VALOR
    FROM
   PEDIDO_MARKETPLACE M
   LEFT JOIN PEDIDO_VENDA P ON (P.ID=M.ID)
   WHERE
     M.DT_FATURA BETWEEN CURRENT_DATE-${num_dias} AND CURRENT_DATE AND
     M.IDMARKETPLACE = ${config_id_marketplace}
  `;

  return await fb5.executeQuery(cmd_sql, []);
}

async function procPedidoMktPlaceMercosSQL(items) {
  if (!Array.isArray(items)) return null;
  if (items.length == 0) return null;

  let cmd_sql = "";
  let cmd_sql_itens = "";
  for (let item of items) {
    if (item?.excluido) return;
    let valor_frete = item?.valor_frete ? item?.valor_frete : 0;
    let id_cliente = 0;
    let vendedor = 1; //vendedor padrao pegar das configuracoes
    let id_mktplace = lib.config_id_marketplace();
    let data_emissao = lib.dateUSToSql(item?.data_emissao);
    let dt_movto = lib.formatDate(data_emissao, "dd.MM.yyyy");

    let transportadora = 0;
    let cpfcnpj = item.cliente_cnpj;
    let rastreio = item.rastreamento;
    let tipo_pedido = "1";
    let empresa = 1;
    let comissao = 0;
    let cupom_desconto = "";
    let nome_transportadora = "";
    let forma_pagamento = "";
    let nome_mktplace = "";
    let nome_vendedor = "";
    let observacao = item?.observacoes ? item?.observacoes : "";
    let modalidade_entrega_nome = item?.modalidade_entrega_nome
      ? item?.modalidade_entrega_nome
      : "";
    let prazo_entrega = item?.prazo_entrega ? item?.prazo_entrega : "";
    let condicao_pagamento_id = Number(
      item?.condicao_pagamento_id ? item?.condicao_pagamento_id : 0
    );
    observacao += ` ${modalidade_entrega_nome} - ${prazo_entrega} `;
    if (observacao) observacao = observacao.substring(0, 240);

    if (condicao_pagamento_id > 0) {
      try {
        let res = await obterIdPlanoPagamento(condicao_pagamento_id);
        if (res?.codigo_erp) forma_pagamento = res?.codigo_erp;
      } catch (error) {
        console.log(error);
      }
    }

    cmd_sql += ` id_pai_pedido = (SELECT RES_ID FROM PEDIDO_SP_I_MKTPLACE
    ('${item.id}',${id_cliente},${item.total}, '${item.numero}','${valor_frete}','${observacao}',${vendedor},'${nome_vendedor}',${id_mktplace},'${nome_mktplace}',
    '${item.condicao_pagamento}', ${item.condicao_pagamento_id}, '${forma_pagamento}', '${dt_movto}', ${transportadora},'${nome_transportadora}','${cpfcnpj}', '${rastreio}',
    '${cupom_desconto}',${comissao},'${tipo_pedido}', ${empresa}  ));\n 
    `;

    cmd_sql_itens = "";
    let seq = 1;
    for (let prod of item?.itens) {
      if (prod.excluido) continue;
      let id_produto = prod.produto_codigo;
      let quantidade = Number(prod.quantidade ? prod.quantidade : 0);
      let preco_tabela = Number(prod.preco_tabela ? prod.preco_tabela : 0);
      let preco_liquido = Number(prod.preco_liquido ? prod.preco_liquido : 0);
      let subtotal = Number(prod.subtotal ? prod.subtotal : 0);

      cmd_sql_itens += `EXECUTE PROCEDURE PRODUTO_PEDIDO_SP_I_MKTPLACE
      (:id_pai_pedido,${id_produto}, ${seq++},${quantidade} , ${preco_tabela}, ${preco_liquido}, ${subtotal} );\n 
      `;
    }
    cmd_sql += cmd_sql_itens;
  }

  let execute_block_sql = `EXECUTE BLOCK
    AS
    declare variable id_pai_pedido integer ;
    BEGIN 
      ${cmd_sql}
    END
  `;

  //console.log(execute_block_sql);

  fb5.firebird.attach(fb5.dboptions, (err, db) => {
    if (err) {
      db.detach(); //testando nao tinha isso aqui
      console.log(err);
      return;
    }

    db.query(execute_block_sql, [], (err, result) => {
      db.detach();
      if (err) {
        console.log(err);
      }
    });
  }); // fb5.firebird
}

async function createPedidoSQL() {
  const pedidoRepository = new PedidoRepository(await TMongo.mongoConnect());
  //{data_emissao: '2025-01-09'}

  let items = await pedidoRepository.findAll({
    sys_status: pedidoTypes.pendente,
  });
  let config_id_marketplace = lib.config_id_marketplace();

  for (let item of items) {
    await procPedidoMktPlaceMercosSQL([item]);
    let pedido = await pedidoJaCadastrado(item.id, config_id_marketplace);
    if (pedido?.id > 0) {
      await pedidoRepository.update(item?.id, {
        sys_status: pedidoTypes.processado,
      });
    }
  }
}

async function recebePedidosB2BHoje() {
  let items = await recebePedidosB2B(0);
  await insertPedido(items);
}

async function recebePedidosB2BUltimosDias() {
  //validar se ja executou no dia
  if ((await systemService.started(1, "pedidos_antigos")) == 1) return;

  let items = await recebePedidosB2B(-7); //pegar do .env o valor
  await insertPedido(items);
}

async function insertPedido(items) {
  if (!items) return;
  if (!Array.isArray(items)) return;
  const pedidoRepository = new PedidoRepository(await TMongo.mongoConnect());
  for (let item of items) {
    if (item?.status != "2") {
      console.log("Pedido nao esta faturado " + item.numero);
      continue;
    }
    await pedidoRepository.create(item);
  }
}

async function recebePedidosB2B(num_dias = 0) {
  if (!num_dias) num_dias = 0;
  let alterado_apos = lib.getAlterado_apos(num_dias, "00:00:00");

  let lote = [];
  let result;
  let eof = 1;

  while (eof > 0) {
    result = await mercosService.getPedidos(alterado_apos);
    if ((await lib.tratarRetorno(result, 200)) == 200)
      eof = result?.data?.length ? result?.data?.length : 0;

    let pedidos = result?.data;
    if (!Array.isArray(pedidos)) break;
    for (let pedido of pedidos) {
      if (pedido.status != String(pedidoStatus.faturado)) continue;
      lote.push(pedido);
      alterado_apos = `alterado_apos=${pedido.ultima_alteracao}`;
    }
  }

  return lote;
}

async function pedidoCancelar(id) {
  let result = await mercosService.cancelarPedidos(id);
  if (result.status == 200) {
    console.log("Cancelado com sucesso");
  }
  console.log(result);
}

async function pedidoEntregue(id) {
  let result = await mercosService.pedidoEntregue(id);
  if (result.status == 200) {
    console.log("Entregue com sucesso");
  }
  //console.log(result);
}

async function updatePedidosB2B() {
  // falta implementar isso
  //   let body = {};
  //   let obj = null;
  //   for (let pedido of lote) {
  //     obj = pedido;
  //     break;
  //   }
  //   let newProd = [];
  //   for (let item of obj?.itens) {
  //     if (item.produto_nome == "a46687bd9b3d4d70") {
  //       item.quantidade = 9;
  //     }
  //     if (item.produto_nome == "ed0a203c4066480d") {
  //       newProd.push({ id: item.id, excluido: true });
  //       continue;
  //     }
  //     newProd.push({ id: item.id, quantidade: item.quantidade });
  //   }
  //   await lib.sleep(1000 * 6);
  //   body.itens = newProd;
  //   //console.log(JSON.stringify(body));
  //   //return;
  //   let result = await mercosService.updatePedidos(2054453, body);
  //   console.log(result);
  //   console.log(JSON.stringify(result.response.data.erros));
}

async function createPedidosB2B() {
  let body = {
    cliente_id: 8125204,
    data_emissao: "2024-08-27",
    data_criacao: "2024-08-27 14:07:45",
    condicao_pagamento_id: 230370,
    //    forma_pagamento_id: 1,
    valor_frete: 0,
    observacoes: "Envio após 1 dia útil.",
    extras: [],
    itens: [
      {
        produto_id: 19094728,
        quantidade: 9,
        preco_tabela: 71.2,
        preco_liquido: 71.2,
        observacoes: "teste",
      },

      {
        produto_id: 19090621,
        quantidade: 4,
        preco_tabela: 20.56,
        preco_liquido: 20.56,
        observacoes: "teste",
      },
    ],
  };

  let result = await mercosService.createPedidos(body);
  console.log(result);
}

async function loadCondPagamento() {
  if (LISTA_COND_PAGAMENTO.length > 0) return;
  const c = await TMongo.mongoConnect();
  const condPagamentoRepository = new CondPagamentoRepository(c);
  let rows = await condPagamentoRepository.findAll({});
  for (let row of rows) {
    LISTA_COND_PAGAMENTO.push(row);
  }
}

async function obterIdPlanoPagamento(id) {
  await loadCondPagamento();
  let result = null;
  for (let condPagamento of LISTA_COND_PAGAMENTO) {
    if (condPagamento.id == id) {
      result = condPagamento;
      break;
    }
  }
  return result;
}

module.exports = {
  init,
  obterPedidosFaturadosSQL,
};
