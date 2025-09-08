//Classe tem letras maiuculoas
const TMongo = require("../infra/mongoClient");

const collection = "tmp_promocao";

class PromocaoRepository {
  constructor() {
    this._db = null;
  }

  // Método interno para obter conexão com o banco
  async _getConnection() {
    if (!this._db) {
      this._db = await TMongo.mongoConnect();
    }
    return this._db;
  }

  async create(payload) {
    const db = await this._getConnection();
    const result = await db.collection(collection).insertOne(payload);
    return result.insertedId;
  }

  async update(id, payload) {
    const db = await this._getConnection();
    const result = await db
      .collection(collection)
      .updateOne({ id: id }, { $set: payload }, { upsert: true });
    return result.modifiedCount > 0;
  }

  async delete(id) {
    const db = await this._getConnection();
    const result = await db.collection(collection).deleteOne({ id: id });
    return result.deletedCount > 0;
  }

  async findAll(criterio = {}) {
    const db = await this._getConnection();
    return await db.collection(collection).find(criterio).toArray();
  }

  async findBySku(sku) {
    const db = await this._getConnection();
    return await db.collection(collection).findOne({ sku: sku.toString() });
  }

  async findById(id) {
    const db = await this._getConnection();
    return await db.collection(collection).findOne({ id: id });
  }

  async findByDescricao(descricao) {
    const db = await this._getConnection();
    return await db.collection(collection).findOne({ descricao: descricao });
  }

  async insertMany(items) {
    if (!Array.isArray(items)) return null;
    try {
      const db = await this._getConnection();
      return await db.collection(collection).insertMany(items);
    } catch (e) {
      console.log(e);
    }
  }

  async deleteMany(criterio = {}) {
    try {
      const db = await this._getConnection();
      return await db.collection(collection).deleteMany(criterio);
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = { PromocaoRepository };
