const express = require("express");
const router = express.Router();
const userController = require("../controllers/register.ctrl");

router.get("/pages-register", (req, res) => {
  res.render("pages-register");
});

router.post("/pages-register", (req, res) => {
  if(req.locate === "pages-register"){
    res.render("pages-register");
  }else{
    res.render("pages-login");
  }
});

router.post("/create-account", userController.createUser, (req, res) => {
  
});

router.post("/userId-check", userController.userIdCheck, (req, res) => {
  res.json({ isAvailable: req.isAvailable });
});

module.exports = router;
