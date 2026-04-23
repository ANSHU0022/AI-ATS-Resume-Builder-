const express = require("express");
const controller = require("../controllers/pdfController.cjs");

const router = express.Router();

router.post("/render", controller.render);

module.exports = router;
