require("express-async-errors");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();
const anuncioRoutes = require("./routes/anuncioRoutes");
const categoriaRoutes = require("./routes/categoriaRoutes");

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
  res.send({
    message: `OK [${new Date()}] - App listening on port ${
      process.env.NODE_PORT
    }`,
  })
);

//this for route will need for store front, also for admin dashboard
app.use("/api/anuncio/", anuncioRoutes);
app.use("/api/categoria/", categoriaRoutes);

// Use express's default error handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(400).json({ message: err.message });
});

module.exports = app;
