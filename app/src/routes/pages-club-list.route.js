const express = require('express');
const router = express.Router();
const { getClubs } = require('../controllers/clubList.ctrl');

router.get("/pages-clubList", (req, res) => {
    res.render("pages-clubList");
});

router.get("/api/clubs", getClubs);

module.exports = router;