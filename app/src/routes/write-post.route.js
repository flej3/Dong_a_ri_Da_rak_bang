const express = require("express");
const router = express.Router();

router.get("/write-post", (req, res) => {
  res.render("write-post");
});

module.exports = router;

