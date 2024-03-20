const express = require("express");
const router = express.Router();

router.get("/pages-login", (req, res) => {
  res.render("pages-login");
});

module.exports = router;
