const express = require("express");
const router = express.Router();

const { processGraph } = require("../controllers/bfhlController");

router.post("/", processGraph);

module.exports = router;