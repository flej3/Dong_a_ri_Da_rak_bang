const express = require("express");
const router = express.Router();
const {searchProfileResult, searchResult} = require("../../controllers/searchCtrollers/searchUser.ctrl");

// res.render("pages-search/search-result");
router.get("/search", (req, res) => {
  res.render("pages-search/search-result");
});

router.get("/search-user", searchResult);

module.exports = router;
