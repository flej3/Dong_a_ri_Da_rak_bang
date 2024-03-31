const express = require("express");
const router = express.Router();
const { createPost, checkClubOwner } = require('../../../controllers/postCtrollers/postRecruitControllers/writePost.ctrl');
const { verifyToken } = require('../../../controllers/tokenControllers/token.ctrl');

router.get("/write-post", verifyToken, (req, res) => {
  res.render("./post/post-recruit/write-post");
});

router.get("/isClubOwner", checkClubOwner);

router.post('/postData', createPost);

module.exports = router;