const pedidoTypes = {
  pendente: 0,
  processado: 1,
  concluido: 10,
  erro: 500,
};

const pedidoStatus = {
  nao_faturado: 0,
  parcialmente_faturado: 1,
  faturado: 2,
};
module.exports = { pedidoTypes, pedidoStatus };
