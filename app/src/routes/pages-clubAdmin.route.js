const express = require("express");
const router = express.Router();
const clubAdminController = require("./../controllers/clubAdmin.ctrl");

// 회원 목록을 가져오는 라우터
router.get("/Page-clubAdmin", clubAdminController.getClubMember);

module.exports = router;