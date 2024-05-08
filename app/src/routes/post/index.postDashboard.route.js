const express = require('express');
const router = express.Router();
const { getRecruitPostList, getLikes, getLikeSplit } = require('../../controllers/postCtrollers/index.postDashboard.ctrl');

router.get('/api/recruitPostDashboard', getRecruitPostList);
router.get('/api/getLikes', getLikes);
router.get('/api/getLikeSplit', getLikeSplit);


module.exports = router;