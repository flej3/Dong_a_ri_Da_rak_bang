const express = require("express");
const router = express.Router();
const { getClubIntroduction, saveClubIntroEdit,getClubDataForGraph } = require("../../controllers/clubIntroductionControllers/clubIntroduction.ctrl")

router.get("/club-introduction", (req, res) => {
    res.render("page-club-introduction/page-club-introduction");
})

router.get("/api/club-introduction-data/get", getClubIntroduction);

router.get("/api/club-data/get", getClubDataForGraph);

router.put("/api/club/intro/edit/save", saveClubIntroEdit);

module.exports = router;