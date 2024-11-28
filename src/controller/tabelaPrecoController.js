const lib = require("../utils/lib");
const fb5 = require("../infra/fb5");
const mercosService = require("../services/mercosService");
const tabelaTypes = require("../types/tabelaTypes");
const tabelaPrecoRepository = require("../repository/tabelaPrecoRepository");
const TMongo = require("../infra/mongoClient");
const systemService = require("../services/systemService");

async function obterTodasTabelasPrecoB2B() {
  let alterado_apos = null;
  let lote = [];
  let result;
  let eof = 1;

  while (eof > 0) {
    result = await mercosService.getTabelasPreco(alterado_apos);
    if ((await lib.tratarRetorno(result, 200)) == 200)
      eof = result?.data?.length ? result?.data?.length : 0;
    console.log("eof", result);

    let tabelas = result?.data;
    if (!Array.isArray(tabelas)) break;
    for (let tabela of tabelas) {
      lote.push(tabela);
      alterado_apos = `alterado_apos=${tabela.ultima_alteracao}`;
    }
  }
  return lote;
}

async function createTabelaPrecoB2B() {
  const tabela_varejo = {
    nome: tabelaTypes.TABELA_PRECO_VAREJO,
    tipo: "P",
    acrescimo: null,
    desconto: 0,
    excluido: false,
  };

  let result = await mercosService.createTabelasPreco(tabela_varejo);
  console.log(result);
  return result;

  //Nao preciso criar a tabela de atacado pois ela é o preço padrao
  const tabela_atacado = {
    nome: tabelaTypes.TABELA_PRECO_ATACADO,
    tipo: "P",
    acrescimo: null,
    desconto: 0,
    excluido: false,
  };
}

async function autoCadastrarTabelasPadrao() {
  //executar 1 x por dia
  let tabelas = await obterTodasTabelasPrecoB2B();
  console.log("tabelas", tabelas);

  return;
  if (!Array.isArray(tabelas)) return;
  if (tabelas?.length == 0) {
    console.log("Nenhuma tabela de preço B2B encontrada");
    await createTabelaPrecoB2B();
    await receberTabelaPrecoB2B();
    return;
  }
}

async function receberTabelaPrecoB2B() {
  let tabelas = await obterTodasTabelasPrecoB2B();
  if (tabelas.length == 0) {
    console.log("Nenhuma tabela de preço B2B encontrada");
    return;
  }

  let repository = new tabelaPrecoRepository.TabelaPrecoRepository(
    await TMongo.mongoConnect()
  );

  for (let tabela of tabelas) {
    tabela.cod_erp = tabelaTypes.TABELA_PRECO_VAREJO;
  }

  await repository.deleteMany();
  await repository.insertMany(tabelas);
}

async function init() {
  //if ((await systemService.started(1, "tabela_preco")) == 1) return;
  await autoCadastrarTabelasPadrao();
  //await receberTabelaPrecoB2B();
}

module.exports = {
  init,
};
