const express = require("express");
const router = express.Router();
const { getClubApplicationsListForIndex, cancelApplication } = require('../../../../controllers/postCtrollers/postRecruitControllers/joinClubControllers/index.clubJoinDashboard.ctrl');

router.get('/api/clubApplications/list/get', getClubApplicationsListForIndex);

router.delete('/api/clubApplications/list/Cancel', cancelApplication)

module.exports = router;