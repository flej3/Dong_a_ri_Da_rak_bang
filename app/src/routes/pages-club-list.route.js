const express = require('express');
const router = express.Router();
const { getClubs } = require('../controllers/clubList.ctrl');

router.get("/pages-clubList", async (req, res) => {
    try {
        const clubs = await getClubs();
        res.render("pages-clubList", { clubs });
    } catch (error) {
        console.error("클럽 검색에 실패했습니다.:", error);
        res.status(500).send("클럽 검색에 실패했습니다.");
    }
});

module.exports = router;