const express = require("express");
const router = express.Router();
const { addCommentNew, getComment, deleteComment, updateComment, addReplyComment } = require('../../../controllers/comments/recruit_comments/recruit_comment.ctrl');

router.post("/api/comments/new", addCommentNew);

router.get("/api/comments/get", getComment);

router.put("/api/comments/delete", deleteComment);

router.put("/api/comments/update", updateComment);

router.post("/api/comments/child/new", addReplyComment);

module.exports = router;