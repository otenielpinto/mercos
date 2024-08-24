const express = require("express");
const router = express.Router();
const {
  doAddAnuncioB2BOne,
  doEnviarImagensProdutoById,
} = require("../controller/produtoController");

//add a product
router.post("/:id", doAddAnuncioB2BOne);

//add images to a product
router.post("/imagens_produto/:id", doEnviarImagensProdutoById);

module.exports = router;
