const express = require('express');
const router = express.Router();
const {getPost} = require('../../../controllers/postCtrollers/postRecruitControllers/viewPost.ctrl');
const { verifyToken } = require('../../../controllers/tokenControllers/token.ctrl');

router.get('/userPosts', getPost);

router.get('/view-current-recruit-post', verifyToken, (req, res) => {
    res.render('./post/post-recruit/view-post');
})

module.exports = router;
