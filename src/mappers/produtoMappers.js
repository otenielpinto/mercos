//aqui poderia importar o types se estiver usando typeScript para mappers
//payload poderia ser do type importado
//Exemplo    produto : TProduto ;
const lib = require("../utils/lib");
const MOEDA_ANUNCIO = "0";

class ProdutoMappers {
  //Explicacao static ( nao preciso de instanciar a classe )

  static toMercos(payload) {
    let id_categoriaweb = payload?.id_categoriaweb;
    let detalhes_html = payload?.detalhes_html;
    let ativo = payload?.vender_web == "S";
    let excluido = false;
    let preco = Number(payload.preco) ? Number(payload.preco) : 0;
    if (payload?.descricao.startsWith(".")) ativo = false;
    if (preco < 0.5) {
      preco = 99999;
    }

    return {
      nome: payload.descricao.substring(0, 100),
      preco_tabela: Number(payload.preco),
      codigo: payload.sku,
      comissao: null,
      ipi: null,
      tipo_ipi: "P",
      st: null,
      moeda: MOEDA_ANUNCIO,
      unidade: payload.unidade ? payload.unidade : "UN",
      saldo_estoque: Number(payload.estoque),
      observacoes: detalhes_html,
      excluido: excluido,
      ativo: ativo,
      exibir_no_b2b: ativo,
      categoria_id: id_categoriaweb,
      codigo_ncm: null,
      peso_bruto: Number(payload.peso),
      largura: Number(payload.largura),
      altura: Number(payload.altura),
      comprimento: Number(payload.comprimento),
      multiplo: 1,
    };
  }
}

module.exports = { ProdutoMappers };
