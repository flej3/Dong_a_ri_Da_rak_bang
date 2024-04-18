const express = require("express");
const router = express.Router();
const clubAdminController = require("./../controllers/clubAdmin.ctrl");
const {verifyToken} = require("../controllers/tokenControllers/token.ctrl");
const { clubApplication, clubApplicationStatusUpdate } = require("../controllers/clubAdminControllers/clubAdminApplication.ctrl");

// 회원 목록을 가져오는 라우터
router.get("/Page-clubAdmin", verifyToken, clubAdminController.isClubMember, clubAdminController.getClubMember);

router.get("/check-member", clubAdminController.checkMember);

router.post("/new-member", clubAdminController.newMember);

router.post("/delete-member", clubAdminController.deleteMember);

router.post("/update-member", clubAdminController.updateMember);

//가입 신청 현황 라우터
router.get("/api/club/application/list/get", clubApplication);

router.put("/api/club/application/update/status", clubApplicationStatusUpdate);

module.exports = router;