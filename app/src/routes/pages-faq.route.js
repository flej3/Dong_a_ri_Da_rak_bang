const express = require("express");
const router = express.Router();

router.get("/pages-faq", (req, res) => {
  res.render("pages-faq");
});

module.exports = router;
