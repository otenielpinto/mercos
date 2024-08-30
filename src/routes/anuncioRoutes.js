const express = require("express");
const router = express.Router();
const {
  doAddAnuncioB2BOne,
  doEnviarImagensProdutoById,
  doGetAnuncioB2B,
} = require("../controller/produtoController");

//add a product
router.post("/:id", doAddAnuncioB2BOne);

//add images to a product
router.post("/imagens_produto/:id", doEnviarImagensProdutoById);

//get all last products create
router.get("/ultimos_produtos", doGetAnuncioB2B);

module.exports = router;
