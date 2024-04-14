const express = require("express");
const router = express.Router();
const { verifyToken } = require('../controllers/tokenControllers/token.ctrl');
const { setCreateClub } = require('../controllers/create-club.ctrl');

router.get("/create-club", verifyToken, (req, res) => {
    res.render("pages-create-club");
});

router.post("/api/create/club/post", setCreateClub);

module.exports = router;
