const express = require("express");
const router = express.Router();
const { getClubIntroduction, saveClubIntroEdit } = require("../../controllers/clubIntroductionControllers/clubIntroduction.ctrl")

router.get("/club-introduction", (req, res) => {
    res.render("page-club-introduction/page-club-introduction");
})

router.get("/api/club-introduction-data/get", getClubIntroduction);

router.put("/api/club/intro/edit/save", saveClubIntroEdit);

module.exports = router;