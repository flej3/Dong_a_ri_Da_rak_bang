const express = require("express");
const router = express.Router();
const loginController = require("../controllers/login.ctrl");
const { isLogin } = require("../controllers/tokenControllers/token.ctrl")

router.get("/pages-login", (req, res) => {
    res.render("pages-login");
});

router.post("/api/users/check-availability", loginController.checkUserAvailability);

//발급된 토근 확인 가능, 어드민을 위한 API
router.get('/api/auth/access-token', loginController.accessToken);

router.get('/api/auth/refresh-token', loginController.refreshToken);
router.post('/api/auth/refresh-token', loginController.refreshToken);

router.get('/api/users/logout', loginController.logout);

//로그인이 되었는지 확인 하는 API, 현재 로그인이 되어있으면 isLogin키값이 T/F로 응답함.
router.get('/isLogin', isLogin)

module.exports = router;
