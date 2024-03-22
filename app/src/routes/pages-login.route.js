const express = require("express");
const router = express.Router();
const loginController = require("../controllers/login.ctrl");

router.get("/pages-login", (req, res) => {
    res.render("pages-login");
});

router.post("/api/users/check-availability", loginController.checkUserAvailability);

//발급된 토근 확인 가능, 어드민을 위한 API
router.get('/api/auth/access-token', loginController.accessToken);

router.get('/api/auth/refresh-token', loginController.refreshToken);
router.post('/api/auth/refresh-token', loginController.refreshToken);

router.get('/api/users/logout', loginController.logout);
// router.post('/api/users/logout', loginController.logout);

// router.get('/login/success', loginController.loginSuccess);

module.exports = router;
