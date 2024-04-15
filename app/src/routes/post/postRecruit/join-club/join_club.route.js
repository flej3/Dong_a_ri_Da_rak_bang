const express = require("express");
const router = express.Router();
const { isJoinedThisClub, getMemberData, setClubApplication } = require('../../../../controllers/postCtrollers/postRecruitControllers/joinClubControllers/joinClub.ctrl');

router.get('/api/check/JoinedThisClub', isJoinedThisClub);

router.get('/api/join_club/memberData/get', getMemberData);

router.post('/api/join_club/applications/post', setClubApplication);

module.exports = router;