const express = require('express');
const router = express.Router();
const { getRecruitPostList } = require('../../controllers/postCtrollers/index.postDashboard.ctrl');

router.get('/api/recruitPostDashboard', getRecruitPostList);

module.exports = router;