//Classe tem letras maiuculoas

const collection = "pedido_venda";

class PedidoRepository {
  constructor(db) {
    this.db = db;
  }

  async create(payload) {
    let id = Number(payload?.id);
    let obj = await this.findById(id);
    if (!obj) {
      if (!payload?.sys_status) payload.sys_status = 0;
      payload.created_at = new Date();
      const result = await this.db.collection(collection).insertOne(payload);
      return result.insertedId;
    } else {
      return this.update(id, payload);
    }
  }

  async update(id, payload) {
    if (!id) return;
    payload.updated_at = new Date();
    const result = await this.db
      .collection(collection)
      .updateOne({ id: Number(id) }, { $set: payload }, { upsert: true });
    return result.modifiedCount > 0;
  }

  async delete(id) {
    const result = await this.db
      .collection(collection)
      .deleteOne({ id: Number(id) });
    return result.deletedCount > 0;
  }

  async findAll(criterio = {}) {
    return await this.db.collection(collection).find(criterio).toArray();
  }

  async findById(id) {
    return await this.db.collection(collection).findOne({ id: Number(id) });
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

module.exports = { PedidoRepository };
