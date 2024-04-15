const express = require("express");
const router = express.Router();
const { verifyToken } = require('../controllers/tokenControllers/token.ctrl');
const { setCreateClub, getCreateClubList } = require('../controllers/create-club.ctrl');

router.get("/create-club", verifyToken, (req, res) => {
    res.render("pages-create-club");
});

router.post("/api/create/club/post", setCreateClub);

router.get("/api/create/club/list/get", getCreateClubList);

router.delete("/api/create/club/delete");

module.exports = router;
