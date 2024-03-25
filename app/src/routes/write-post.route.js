const express = require("express");
const router = express.Router();
const {createPost} =require("./../controllers/writePost.ctrl")

// 로그인 상태를 확인하는 함수
function checkAuth(req, res, next) {
  // 쿠키에서 accessToken 가져오기
  const accessToken = req.cookies.accessToken;

  if (accessToken) {
    next();
  } else {
    res.redirect("/pages-login");
  }
}

router.get("/write-post", checkAuth, (req, res) => {
  res.render("write-post");
});

router.post('/postData', checkAuth, createPost);

module.exports = router;

