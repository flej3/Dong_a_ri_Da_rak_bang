const express = require("express");
const router = express.Router();
const {checkAndFetchUserProfile, updateUserProfile} = require("./../controllers/profileCtrollers/profile.ctrl");

router.get("/users-profile", (req, res) => {
  res.render("users-profile");
});

router.post("/update-user-profile",updateUserProfile);

router.get("/check-profile-existence", checkAndFetchUserProfile);

module.exports = router;
