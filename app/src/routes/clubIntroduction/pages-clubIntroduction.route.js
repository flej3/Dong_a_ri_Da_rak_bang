const express = require("express");
const router = express.Router();
const { getClubIntroduction, saveClubIntroEdit,getClubDataForGraph } = require("../../controllers/clubIntroductionControllers/clubIntroduction.ctrl")
const { getClubLikes, addClubLike, deleteClubLike, getClubLike, getClubLikesCount } = require("../../controllers/clubIntroductionControllers/clubLikes.ctrl");

router.get("/club-introduction", (req, res) => {
    res.render("page-club-introduction/page-club-introduction");
})

router.get("/api/club-introduction-data/get", getClubIntroduction);

router.get("/api/club-data/get", getClubDataForGraph);

router.put("/api/club/intro/edit/save", saveClubIntroEdit);

router.get("/api/club/like", getClubLikes);

router.post("/api/club/like/add", addClubLike);

router.delete("/api/club/like/delete", deleteClubLike);

router.get("/api/club/like/one/get", getClubLike);

router.get("/api/club/likes/count", getClubLikesCount);

module.exports = router;