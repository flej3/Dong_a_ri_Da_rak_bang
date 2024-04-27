const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../controllers/tokenControllers/token.ctrl');
const clubAdminController = require("./../../controllers/clubAdmin.ctrl");
const { getClubData, removeUserFromClub, checkClubOwner } = require("../../controllers/clubAdminControllers/clubProfileControllers/clubProfile.ctrl");

router.get('/club-profile', verifyToken, (req, res) => {
    res.render('./page-club-profile/page-club-profile');
})

router.get("/get-clubs", clubAdminController.getClubs);

router.get("/api/club/data/get", getClubData);

router.get("/api/club/owner/resignation/check", checkClubOwner);

router.delete("/api/club/resignation/delete", removeUserFromClub);

module.exports = router;