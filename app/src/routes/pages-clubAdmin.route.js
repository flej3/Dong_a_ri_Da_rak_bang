const express = require("express");
const router = express.Router();
const clubAdminController = require("./../controllers/clubAdmin.ctrl");
const userController = require("../controllers/register.ctrl");

// 회원 목록을 가져오는 라우터
router.get("/Page-clubAdmin", clubAdminController.getClubMember);

router.post("/new-member", clubAdminController.newMember);

router.post("/delete-member", clubAdminController.deleteMember);

router.post("/update-member", clubAdminController.updateMember);

module.exports = router;