const express = require("express");
const router = express.Router();
const { checkAndFetchUserProfile, updateUserProfile } = require("../controllers/profileCtrollers/profileEdit.ctrl");
const { getUserProfile } = require("../controllers/profileCtrollers/profileView.ctrl");
const { setChangePassword } = require("../controllers/profileCtrollers/profileChangePw.ctrl");
const { verifyToken } = require('../controllers/tokenControllers/token.ctrl');
const { deleteAccount, checkPw } = require('../controllers/profileCtrollers/profileDeleteAccount.ctrl');

router.get("/users-profile", verifyToken, (req, res) => {
  res.render("users-profile");
});

router.get("/getUserProfileData", getUserProfile);

router.post("/update-user-profile", updateUserProfile);

router.get("/check-profile-existence", checkAndFetchUserProfile);

router.post("/setChangePassword", setChangePassword);

router.post("/api/account/check/pw", checkPw)

router.delete("/api/delete/account/check/pw", deleteAccount);

module.exports = router;
