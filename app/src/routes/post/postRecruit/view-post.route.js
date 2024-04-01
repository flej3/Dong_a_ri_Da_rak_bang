const express = require('express');
const router = express.Router();
const { getPost, getViewRecruitPostFromNum } = require('../../../controllers/postCtrollers/postRecruitControllers/viewPost.ctrl');
const { verifyToken } = require('../../../controllers/tokenControllers/token.ctrl');

router.get('/userPosts', verifyToken, getPost);

//최근에 작성한 게시글 홍보글로 이동
router.get('/view-current-recruit-post', (req, res, next) => {
    // query가 있는 경우
    if (req.query.query) {
        // verifyToken을 실행하지 않고 다음 미들웨어 함수로 이동
        return next();
    } else {
        // query가 없는 경우 verifyToken 실행
        verifyToken(req, res, next);
    }
}, (req, res) => {
    res.render('./post/post-recruit/view-post');
});

//post_number를 기준으로 홍보게시판을 보여준다.
router.get('/view-recruit-post-from-postNum', getViewRecruitPostFromNum);

module.exports = router;
