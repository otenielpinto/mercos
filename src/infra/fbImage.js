const FirebirdImage = require("node-firebird");

const options = {};
options.host = process.env.FIREBIRD_IMAGE_HOST;
options.port = Number(process.env.FIREBIRD_IMAGE_PORT) || 4444;
options.database = process.env.FIREBIRD_IMAGE_DATABASE;
options.user = String(process.env.FIREBIRD_IMAGE_USER);
options.password = String(process.env.FIREBIRD_IMAGE_PWD);
options.lowercase_keys = true; // set to true to lowercase keys
options.role = null; // default
options.pageSize = 8192; // default when creating database
options.retryConnectionInterval = 5000; // reconnect interval in case of connection drop
options.blobAsText = true;
options.encoding = "UTF8"; //WIN1252

//base64
async function readBlobToBase64(row) {
  return new Promise((resolve, reject) => {
    row.img(function (err, name, eventEmitter) {
      if (err) reject(err);
      let buffers = [];
      eventEmitter.on("data", function (chunk) {
        buffers.push(chunk);
      });

      eventEmitter.once("end", function () {
        let buffer = Buffer.concat(buffers);
        var base64 = buffer.toString("base64");
        resolve(base64);
      });
    });
  });
}

const fbImageQuery = (ssql, parameters) => {
  return new Promise((resolve, reject) => {
    FirebirdImage.attach(options, function (err, db) {
      if (err) reject(err);

      // db = DATABASE
      db.query(ssql, async function (err, rows) {
        if (err) reject(err);
        const items = [];

        try {
          for (let row of rows) {
            let base64 = await readBlobToBase64(row);
            items.push({
              id: row.id,
              id_produto: row.id_produto,
              ordem: row.ordem,
              imagem_base64: base64,
            });
          }
        } catch (error) {
          db.detach();
          reject(error);
        }

        db.detach();
        resolve(items);
      }); //db = database
    }); //firebirdImage
  }); //promise
};

const fbImageByIdProduto = async (id_produto) => {
  return await fbImageQuery(
    `select * from produto where id_produto = ${id_produto} order by ordem `,
    []
  );
};

module.exports = {
  FirebirdImage,
  fbImageQuery,
  fbImageByIdProduto,
  readBlobToBase64,
};
