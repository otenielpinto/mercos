require("express-async-errors");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();

if (process.env.NODE_ENV !== "production") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN }));

//Minhas rotas igual eu faço com o horse
app.get("/health", (req, res) =>
  res.send(
    `OK [${new Date()}] - App listening on port ${process.env.NODE_PORT}`
  )
);

// app.post("/pedido", hookPedidoController.doInsert);
// app.get("/pedido", (req, res) =>
//   res.send(`OK [${new Date()}] - Hook para receber pedido `)
// );

module.exports = app;
