const express = require("express");
const router = express.Router();
const userActiveController = require("./../controllers/userActive.ctrl");

router.get("/users-active", (req, res) => {
    res.render("users-active");
});

router.get("/api/getUserComment", userActiveController.getUserComment);
router.get("/api/getUserLikeClub", userActiveController.getUserLike);
router.get("/api/getUserLikePost", userActiveController.getUserLikePost);

module.exports = router;
