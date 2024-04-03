const express = require('express');
const router = express.Router();
const { getViewRecruitPostFromNum } = require('../../../controllers/postCtrollers/postRecruitControllers/viewPost.ctrl');

router.get('/view-recruit-post', (req, res) => {
    res.render('./post/post-recruit/view-post');
})

//post_number를 기준으로 홍보게시판을 보여준다.
router.get('/view-recruit-post-from-postNum', getViewRecruitPostFromNum);

module.exports = router;
