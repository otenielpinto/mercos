const express = require("express");
const router = express.Router();
const { doCreate } = require("../controller/categoriaController");

//add a product
router.post("/create", doCreate);

module.exports = router;
