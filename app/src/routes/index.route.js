const express = require("express");
const indexController =require("./../controllers/index.ctrl");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

module.exports = router;
