//Classe tem letras maiuculoas
const TMongo = require("../infra/mongoClient");
const collection = "mpk_anuncio";

class MpkAnuncio {
  constructor() {
    this.db = null;
  }

  // Método interno para obter conexão com o banco
  async _getConnection() {
    if (!this.db) {
      this.db = await TMongo.mongoConnect();
    }
    return this.db;
  }

  async create(payload) {
    await this._getConnection();
    const result = await this.db.collection(collection).insertOne(payload);
    return result.insertedId;
  }

  async update(id, payload) {
    await this._getConnection();
    payload.update_at = new Date();
    const result = await this.db
      .collection(collection)
      .updateOne({ id: Number(id) }, { $set: payload }, { upsert: true });
    return result; // preciso pegar dados de retorno
  }

  async delete(id) {
    await this._getConnection();
    const result = await this.db
      .collection(collection)
      .deleteOne({ id: Number(id) });
    return result.deletedCount > 0;
  }

  async findAll(criterio = {}) {
    await this._getConnection();
    return await this.db.collection(collection).find(criterio).toArray();
  }

  async findById(id) {
    await this._getConnection();
    return await this.db.collection(collection).findOne({ id: Number(id) });
  }

  async insertMany(items) {
    await this._getConnection();
    if (!Array.isArray(items)) return null;
    try {
      return await this.db.collection(collection).insertMany(items);
    } catch (e) {
      console.log(e);
    }
  }

  async deleteMany(criterio = {}) {
    await this._getConnection();
    try {
      return await this.db.collection(collection).deleteMany(criterio);
    } catch (e) {
      console.log(e);
    }
  }

  async findAllByIds(criterio = {}) {
    await this._getConnection();
    let queryObject = criterio;
    let sort = { id: 1 };

    const rows = await this.db
      .collection(collection)
      .aggregate([
        {
          $match: queryObject,
        },
        //second stage
        {
          $group: {
            _id: "$_id",
            id: { $first: "$id" },
            sku: { $first: "$sku" },
            meuspedidosid: { $first: "$meuspedidosid" },
          },
        },

        // Third Stage
        {
          $sort: sort,
        },
      ])
      .toArray();
    return rows;
  }
  async updateMany(query = {}, fields = {}) {
    await this._getConnection();
    try {
      return await this.db
        .collection(collection)
        .updateMany(query, { $set: fields });
    } catch (e) {
      console.log(e);
    }
  }
  async updateEstoqueMany(items = []) {
    await this._getConnection();
    const update_at = new Date();
    if (!Array.isArray(items)) return null;
    let query = {};
    let fields = {};
    for (let item of items) {
      query = { id: Number(item?.id) };
      fields = {
        estoque: Number(item?.estoque),
        preco: Number(item?.preco),
        preco_promocional: Number(item?.preco_promocional),
        update_at,
      };

      try {
        return await this.db
          .collection(collection)
          .updateMany(query, { $set: fields });
      } catch (e) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log(e);
      }
    } //for
  }
}

module.exports = { MpkAnuncio };
