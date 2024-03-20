const express = require("express");
const router = express.Router();
const loginController = require("../controllers/login.ctrl");

router.get("/pages-login", (req, res) => {
    res.render("pages-login");
});

router.post("/pages-login", loginController.checkUserAvailability);

router.post("/api/users/check-availability", loginController.checkUserAvailability, (req, res) => {
    
})

module.exports = router;
