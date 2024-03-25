const express = require('express');
const router = express.Router();
const {getPost} = require('../controllers/post.ctrl');
const postModel = require('../models/post');

// 사용자의 게시글을 가져오는 GET 요청 핸들러
// router.get('/userPosts', async (req, res) => {
//     try {
//         const userPosts = await postModel.find({ user_id: req.user.id }); // 사용자의 게시글을 가져오는 기능
//         res.json(userPosts); // JSON 형태로 사용자의 게시글 응답
//     } catch (err) {
//         console.error('게시글을 가져오는 데 에러 발생:', err);
//         res.status(500).json({ message: '게시글을 가져오는 데 문제가 발생했습니다.' });
//     }

// });

router.get('/userPosts', getPost);

router.get('/post', (req, res) => {
    res.render('post');
})

module.exports = router;
