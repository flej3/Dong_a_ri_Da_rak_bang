const express = require("express");
const router = express.Router();

router.get('/error-page', (req, res) => {
    res.render('pages-error');
})

module.exports = router;