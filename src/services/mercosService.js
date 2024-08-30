const api = require("../api/mercosApi");
const lib = require("../utils/lib");

/*
https://publicapis.io/woocommerce-api
class Mercos {
  constructor() {}
  async get(url) {}
  async post(url, data = {}) {}
  async put(url, data) {}
  async delete(url) {}
  async patch(url, data = {}) {}
}

const mercos = new Mercos();
mercos.put(url, data);
mercos.post(url, data);
mercos.get(url);
mercos.delete(url);
mercos.patch(url, data);
*/

async function getProdutos(alterado_apos) {
  if (!alterado_apos) alterado_apos = "alterado_apos=2024-01-01 00:00:00";
  try {
    let res = await api(`v1/produtos?${alterado_apos}`, null, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getProdutos_por_id(id) {
  try {
    let res = await api(`v1/produtos/${id}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function createProdutos(data) {
  let body = { ...data, date_created: new Date() };
  try {
    let res = await api(`v1/produtos`, body, "POST");
    return res;
  } catch (error) {
    //console.log(error);
    return error.response;
  }
}

async function updateProdutos(id, data) {
  try {
    let res = await api(`v1/produtos/${id}`, data, "PUT");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}
//********************************************************************** */

async function ajustar_estoque_em_lote(data) {
  //O limite de ajustes de estoque por requisição é de 300.
  try {
    let res = await api(`v1/ajustar_estoque_em_lote`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error?.response;
  }
}

async function imagens_produto(data = {}) {
  try {
    let res = await api(`v1/imagens_produto`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getTabelasPreco(alterado_apos = null) {
  if (!alterado_apos) alterado_apos = "alterado_apos=2016-08-26 15:00:09";
  try {
    let res = await api(`/v1/tabelas_preco?${alterado_apos}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getTabelas_preco_por_id(id) {
  try {
    let res = await api(`v1/tabelas_preco/${id}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function createTabelasPreco(data) {
  try {
    let res = await api(`v1/tabelas_preco`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function updateTabelasPreco(id, data) {
  try {
    let res = await api(`v1/tabelas_preco/${id}`, data, "PUT");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getProdutos_tabela_preco(alterado_apos) {
  try {
    let res = await api(
      `/v1/produtos_tabela_preco?${alterado_apos}`,
      {},
      "GET"
    );
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getProdutos_tabela_preco_por_id(id) {
  try {
    let res = await api(`v1/produtos_tabela_preco/${id}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function createProdutos_tabela_preco(data) {
  try {
    let res = await api(`v1/produtos_tabela_preco`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function updateProdutos_tabela_preco(id, data) {
  try {
    let res = await api(`v1/produtos_tabela_preco/${id}`, data, "PUT");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function produtos_tabela_preco_em_lote(data) {
  //A quantidade máxima de registros enviados por requisição é 300.
  try {
    let res = await api(`v1/produtos_tabela_preco_em_lote`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getClientes(alterado_apos) {
  try {
    let res = await api(`v1/clientes?${alterado_apos}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getClientes_por_id(id) {
  try {
    let res = await api(`v1/clientes/${id}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function createClientes(data) {
  try {
    let res = await api(`v1/clientes`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function updateClientes(id, data) {
  try {
    let res = await api(`v1/clientes/${id}`, data, "PUT");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getRedes(alterado_apos) {
  try {
    let res = await api(`v1/redes`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getRedes_por_id(id) {
  try {
    let res = await api(`v1/redes/${id}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function createRedes(data) {
  try {
    let res = await api(`v1/redes`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function updateRedes(id, data) {
  try {
    let res = await api(`v1/redes/${id}`, data, "PUT");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getSegmentos(alterado_apos) {
  try {
    let res = await api(`v1/segmentos?${alterado_apos}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getSegmentos_por_id(id) {
  try {
    let res = await api(`v1/segmentos/${id}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function createSegmentos(data) {
  try {
    let res = await api(`v1/segmentos`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function updateSegmentos(id, data) {
  try {
    let res = await api(`v1/segmentos/${id}`, data, "PUT");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getTags_de_clientes(alterado_apos) {
  try {
    let res = await api(`v1/tags_de_clientes?${alterado_apos}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getTags_de_clientes_por_id(id) {
  try {
    let res = await api(`v1/tags_de_clientes/${id}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function createTags_de_clientes(data) {
  try {
    let res = await api(`v1/tags_de_clientes`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function updateTags_de_clientes(id, data) {
  try {
    let res = await api(`v1/tags_de_clientes/${id}`, data, "PUT");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getCampos_extras_cliente(alterado_apos) {
  try {
    let res = await api(`v1/campos_extras_cliente?${alterado_apos}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function createCampos_extras_cliente(data) {
  try {
    let res = await api(`v1/campos_extras_cliente`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function updateCampos_extras_cliente(id, data) {
  try {
    let res = await api(`v1/campos_extras_cliente/${id}`, data, "PUT");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getCategorias(alterado_apos) {
  if (!alterado_apos) alterado_apos = "alterado_apos=2024-01-01 00:00:00";
  try {
    let res = await api(`v1/categorias?${alterado_apos}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getCategorias_por_id(id) {
  try {
    let res = await api(`v1/categorias/${id}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function createCategorias(data) {
  try {
    let res = await api(`v1/categorias`, data, "post");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function updateCategorias(id, data) {
  try {
    let res = await api(`v1/categorias/${id}`, data, "PUT");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getUsuarios(alterado_apos) {
  try {
    let res = await api(`v1/usuarios?${alterado_apos}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getUsuarios_por_id(id) {
  try {
    let res = await api(`v1/usuarios/${id}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getTransportadoras(alterado_apos) {
  if (!alterado_apos) alterado_apos = "alterado_apos=2024-01-01 15:00:00";
  try {
    let res = await api(`v1/transportadoras?${alterado_apos}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getTransportadoras_por_id(id) {
  try {
    let res = await api(`v1/transportadoras/${id}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function createTransportadoras(data) {
  try {
    let res = await api(`v1/transportadoras`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function updateTransportadoras(id, data) {
  try {
    let res = await api(`v1/transportadoras/${id}`, data, "PUT");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getCondicoes_pagamento(alterado_apos = null) {
  if (!alterado_apos) alterado_apos = "alterado_apos=2024-08-26 15:00:09";
  try {
    let res = await api(`v1/condicoes_pagamento?${alterado_apos}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getCondicoes_pagamento_por_id(id) {
  try {
    let res = await api(`v1/condicoes_pagamento/${id}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function createCondicoes_pagamento(data) {
  try {
    let res = await api(`v1/condicoes_pagamento`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function updateCondicoes_pagamento(id, data) {
  try {
    let res = await api(`v1/condicoes_pagamento/${id}`, data, "PUT");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function createClientes_condicoes_pagamento(data) {
  try {
    let res = await api(`v1/clientes_condicoes_pagamento`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function updateClientes_condicoes_pagamento_liberar_todas(data) {
  try {
    let res = await api(
      `v1/clientes_condicoes_pagamento/liberar_todas`,
      data,
      "POST"
    );
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getFormas_pagamento(alterado_apos) {
  try {
    let res = await api(`v1/formas_pagamento?${alterado_apos}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getFormas_pagamento_por_id(id) {
  try {
    let res = await api(`v1/formas_pagamento/${id}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function createFormas_pagamento(data) {
  try {
    let res = await api(`v1/formas_pagamento`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function updatesFormas_pagamento(id, data) {
  try {
    let res = await api(`v1/formas_pagamento/${id}`, data, "PUT");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getPedidos(alterado_apos) {
  try {
    let res = await api(`v2/pedidos?${alterado_apos}&status=2`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getPedidos_por_id(id) {
  try {
    let res = await api(`v2/pedidos/${id}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function createPedidos(data) {
  try {
    let res = await api(`v2/pedidos`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function updatePedidos(id, data) {
  //Quando realizar uma requisição do tipo PUT, só envie os campos que deseja alterar.
  try {
    let res = await api(`v2/pedidos/${id}`, data, "PUT");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function cancelarPedidos(id) {
  try {
    let res = await api(`v1/pedidos/cancelar/${id}`, {}, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getPedidosStatus(alterado_apos) {
  try {
    let res = await api(`v1/pedidos/status?${alterado_apos}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getPedidosStatus_por_id(id) {
  try {
    let res = await api(`v1/pedidos/status/${id}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function createPedidos_status(data) {
  try {
    let res = await api(`v1/pedidos/status`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function updatePedidos_status(id, data) {
  try {
    let res = await api(`v1/pedidos/status/${id}`, data, "PUT");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function updateStatusPedidoById(id, data) {
  try {
    let res = await api(`v1/pedidos/${id}/status`, data, "PUT");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getHistoricoStatusPedidos(id) {
  try {
    let res = await api(`v1/pedidos/${id}/status`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getPromocoes(alterado_apos = null) {
  if (!alterado_apos) alterado_apos = "alterado_apos=2024-01-01 00:00:00";
  try {
    let res = await api(`v1/promocoes?${alterado_apos}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getPromocoes_por_id(id) {
  try {
    let res = await api(`v1/promocoes/${id}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function createPromocoes(data) {
  try {
    let res = await api(`v1/promocoes`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function updatePromocoes(id, data) {
  try {
    let res = await api(`v1/promocoes/${id}`, data, "PUT");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getVariacoes(alterado_apos) {
  try {
    let res = await api(`v1/variacao?${alterado_apos}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function getVariacoes_por_id(id) {
  try {
    let res = await api(`v1/variacao/${id}`, {}, "GET");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function createVariacoes(data) {
  try {
    let res = await api(`v1/variacao`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function updateVariacoes(id, data) {
  try {
    let res = await api(`v1/variacao/${id}`, data, "PUT");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function faturarPedido(data) {
  try {
    let res = await api(`v1/faturamento`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function alterarFaturamento(id, data) {
  try {
    let res = await api(`v1/faturamento/${id}`, data, "PUT");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function clientes_tabela_preco(data) {
  try {
    let res = await api(`v1/clientes_tabela_preco`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

async function clientes_tabela_preco_liberar_todas(data) {
  try {
    let res = await api(`v1/clientes_tabela_preco/liberar_todas`, data, "POST");
    return res;
  } catch (error) {
    console.log(error);
    return error.response;
  }
}

module.exports = {
  clientes_tabela_preco,
  clientes_tabela_preco_liberar_todas,

  faturarPedido,
  alterarFaturamento,

  createClientes_condicoes_pagamento,
  updateClientes_condicoes_pagamento_liberar_todas,

  getCategorias,
  getCategorias_por_id,
  createCategorias,
  updateCategorias,

  getProdutos,
  getProdutos_por_id,
  createProdutos,
  updateProdutos,

  getClientes,
  getClientes_por_id,
  createClientes,
  updateClientes,

  getCondicoes_pagamento,
  createCondicoes_pagamento,
  updateCondicoes_pagamento,
  getCondicoes_pagamento_por_id,

  ajustar_estoque_em_lote,
  imagens_produto,

  getTabelasPreco,
  getTabelas_preco_por_id,
  createTabelasPreco,
  updateTabelasPreco,
  produtos_tabela_preco_em_lote,

  getPedidos,
  getPedidos_por_id,
  createPedidos,
  updatePedidos,
  cancelarPedidos,

  getTransportadoras,
  getTransportadoras_por_id,
  createTransportadoras,
  updateTransportadoras,

  getPedidosStatus,
  getPedidosStatus_por_id,
  createPedidos_status,
  updatePedidos_status,
  updateStatusPedidoById,
  getHistoricoStatusPedidos,

  getPromocoes,
  getPromocoes_por_id,
  createPromocoes,
  updatePromocoes,

  getVariacoes,
  getVariacoes_por_id,
  createVariacoes,
  updateVariacoes,
};
