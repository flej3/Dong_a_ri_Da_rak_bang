const express = require("express");
const router = express.Router();

router.get("/users-profile", (req, res) => {
  res.render("users-profile");
});

module.exports = router;
