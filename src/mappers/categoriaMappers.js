//aqui poderia importar o types se estiver usando typeScript para mappers
//payload poderia ser do type importado
//Exemplo    produto : TProduto ;
const lib = require("../utils/lib");

class CategoriaMappers {
  //Explicacao static ( nao preciso de instanciar a classe )
  static toMercos(payload) {
    const obj = {
      id: payload.id_ext,
      nome: String(payload.descricao),
      excluido: false,
    };
    if (payload.parent && payload.parent > 0)
      obj.categoria_pai_id = payload.parent;
    return obj;
  }
}

module.exports = { CategoriaMappers };
