const express = require("express");
const router = express.Router();
const { verifyToken } = require('../controllers/tokenControllers/token.ctrl');

router.get("/create-club", verifyToken, (req, res) => {
    res.render("pages-create-club");
});

module.exports = router;
