const express = require("express");
const router = express.Router();
const { checkAndFetchUserProfile, updateUserProfile } = require("../controllers/profileCtrollers/profileEdit.ctrl");
const { getUserProfile } = require("../controllers/profileCtrollers/profileView.ctrl");
const { setChangePassword } = require("../controllers/profileCtrollers/profileChangePw.ctrl");

router.get("/users-profile", (req, res) => {
  res.render("users-profile");
});

router.get("/getUserProfileData", getUserProfile);

router.post("/update-user-profile", updateUserProfile);

router.get("/check-profile-existence", checkAndFetchUserProfile);

router.post("/setChangePassword", setChangePassword);

module.exports = router;
