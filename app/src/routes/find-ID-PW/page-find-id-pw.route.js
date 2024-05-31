const express = require('express');
const router = express.Router();
const { findID, checkPwCode, changePw } = require('../../controllers/find-ID-PW/findIdPw.ctrl');

router.get("/pages-find-id-pw", (req, res) => {
    res.render("pages-findIdPw");
});

router.post("/api/find/ID", findID);

router.post("/api/check/change/pw/code", checkPwCode);

router.put("/api/change/pw", changePw);

module.exports = router;
