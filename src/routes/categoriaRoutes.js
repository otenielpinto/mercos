const express = require("express");
const router = express.Router();
const {
  doCreate,
  doGetCategoriasB2B,
} = require("../controller/categoriaController");

//add a product
router.post("/create", doCreate);
router.get("/all", doGetCategoriasB2B);

module.exports = router;
