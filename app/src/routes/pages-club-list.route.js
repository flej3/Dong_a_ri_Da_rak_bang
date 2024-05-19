const express = require('express');
const router = express.Router();
const { getClubs, getClubsByAffilition } = require('../controllers/clubList.ctrl');

router.get("/pages-clubList", (req, res) => {
    res.render("pages-clubList");
});

router.get("/api/clubs", getClubs);
router.get("/api/clubs/:affilition", getClubsByAffilition);

module.exports = router;
