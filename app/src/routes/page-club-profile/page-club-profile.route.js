const express = require('express');
const router = express.Router();
const {verifyToken} = require('../../controllers/tokenControllers/token.ctrl');
const userController = require("../../controllers/register.ctrl");
const clubAdminController = require("./../../controllers/clubAdmin.ctrl");
router.get('/club-profile', verifyToken, (req, res) => {
    res.render('./page-club-profile/page-club-profile');
})

router.get("/get-clubs", clubAdminController.getClubs);

module.exports = router;