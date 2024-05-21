const express = require("express");
const router = express.Router();
const { createPost, checkClubOwner, getEnv } = require('../../../controllers/postCtrollers/postRecruitControllers/writePost.ctrl');
const { verifyToken } = require('../../../controllers/tokenControllers/token.ctrl');

router.get("/write-post", verifyToken, (req, res) => {
  res.render("./post/post-recruit/write-post");
});

router.get("/isClubOwner", checkClubOwner);

router.post('/postData', createPost);

//env 변수 가져오기 (필요한 변수를 쿼리에 넣어주면 됌.)
router.get("/api/get/env", getEnv);

module.exports = router;