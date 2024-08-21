//Classe tem letras maiuculoas

const collection = "wcategory";

class CategoriaRepository {
  constructor(db) {
    this.db = db;
  }

  async create(payload) {
    //ja existe o objeto nao fazer nada
    const obj = await this.findById(payload?.id);
    if (obj?.id > 0) return;

    const result = await this.db.collection(collection).insertOne(payload);
    return result.insertedId;
  }

  async update(id, payload) {
    const result = await this.db
      .collection(collection)
      .updateOne({ id: id }, { $set: payload });
    return result.modifiedCount > 0;
  }

  async delete(id) {
    const result = await this.db.collection(collection).deleteOne({ id: id });
    return result.deletedCount > 0;
  }

  async findAll(criterio = {}) {
    return await this.db.collection(collection).find(criterio).toArray();
  }

  async findById(id) {
    return await this.db.collection(collection).findOne({ id: id });
  }

  async findByDescricao(descricao) {
    return await this.db
      .collection(collection)
      .findOne({ descricao: descricao });
  }

  async insertMany(items) {
    if (!Array.isArray(items)) return null;
    try {
      return await this.db.collection(collection).insertMany(items);
    } catch (e) {
      console.log(e);
    }
  }

  async deleteMany(criterio = {}) {
    try {
      return await this.db.collection(collection).deleteMany(criterio);
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = { CategoriaRepository };
