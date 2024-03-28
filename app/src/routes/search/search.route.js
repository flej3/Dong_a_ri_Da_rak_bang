const express = require("express");
const router = express.Router();
const {searchProfileResult, searchResult} = require("../../controllers/searchCtrollers/searchUser.ctrl");

router.get("/search", (req, res) => {
  res.render("pages-search/search-result");
});

router.get("/search-user", searchResult);

router.get("/search-user-profile", (req, res)=>{
  res.render("pages-search/user_search_profile")
});

router.get("/api/search-user-profile", searchProfileResult);

module.exports = router;
