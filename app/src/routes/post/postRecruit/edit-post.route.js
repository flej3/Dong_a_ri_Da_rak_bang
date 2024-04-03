const express = require("express");
const router = express.Router();
const { verifyToken } = require('../../../controllers/tokenControllers/token.ctrl');
const { setPostUpdate, verifyEditAccess, setDeletePost } = require('../../../controllers/postCtrollers/postRecruitControllers/editPost.ctrl');

router.get("/edit-post", verifyToken, (req, res) => {
    res.render("./post/post-recruit/edit-post");
});

router.post("/post-update", setPostUpdate);

router.get("/verifyEditAccess", verifyEditAccess);

router.post("/post-delete", setDeletePost);

module.exports = router;