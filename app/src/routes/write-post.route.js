const express = require("express");
const router = express.Router();
const {createPost} = require("./../controllers/writePost.ctrl")

router.get("/write-post", (req, res) => {
  res.render("write-post");
});

router.post('/postData', createPost);

module.exports = router;