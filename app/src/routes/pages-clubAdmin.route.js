const express = require("express");
const router = express.Router();
const clubAdminController = require("./../controllers/clubAdmin.ctrl");
const {verifyToken} = require("../controllers/tokenControllers/token.ctrl");
const { clubApplication, clubApplicationStatusUpdate } = require("../controllers/clubAdminControllers/clubAdminApplication.ctrl");
const { getClubRecruitPostList } = require("../controllers/clubAdminControllers/clubRecruitPost.ctrl");
const { postClubNoticePost, getClubNoticePost, getDetailNotice, hasClubAdminAc, updateClubNotice, deleteClubNotice, clubOwnerCheck } = require("../controllers/clubAdminControllers/clubNoticePost.ctrl");

// 회원 목록을 가져오는 라우터
router.get("/Page-clubAdmin", verifyToken, clubAdminController.isClubMember, clubAdminController.getClubMember);

router.get("/check-member", clubAdminController.checkMember);

router.post("/new-member", clubAdminController.newMember);

router.post("/delete-member", clubAdminController.deleteMember);

router.post("/update-member", clubAdminController.updateMember);

router.post("/change-owner", clubAdminController.changeOwner);

//가입 신청 현황 라우터
router.get("/api/club/application/list/get", clubApplication);

router.put("/api/club/application/update/status", clubApplicationStatusUpdate);

//모집 공고 가져오는 라우터
router.get("/api/club/recruitPost/list/get", getClubRecruitPostList);

//공지사항 라우터
router.post('/api/club/notice/create/push', postClubNoticePost);

router.get('/api/club/notice/post/get', getClubNoticePost);

router.get('/api/club/notice/detail/get', getDetailNotice);

router.get('/api/club/adminAc/check/get', hasClubAdminAc);

router.put('/api/club/notice/data/update', updateClubNotice);

router.delete('/api/club/notice/delete', deleteClubNotice);

router.get('/api/club/owner/check', clubOwnerCheck);

module.exports = router;