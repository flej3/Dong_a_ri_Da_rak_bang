const { executeQuery } = require("../../../config/database.func");
const { handleDBError } = require("../../../controllers/login.ctrl");
const { getTokenDecode } = require("../../tokenControllers/token.ctrl");

const addCommentNew = async (req, res) => {
    const resData = {};
    try {
        const commentData = req.body;
        const decodedToken = await getTokenDecode(req, res);

        commentData.userId = decodedToken.id;
        executeQuery('INSERT INTO post_recruit_comments (post_number, user_id, content) VALUES (?,?,?);',
            [commentData.postNumber, commentData.userId, commentData.content],
            (err, result) => {
                if (err) {
                    handleDBError(`댓글을 DB에 넣을때 에러 발생: ${err}`);
                    resData.success = false;
                    return res.json(resData);
                }
                resData.success = true;
                res.json(resData);
            }
        )
    } catch (error) {
        console.error("댓글 작성 실패", error);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const getComment = async (req, res) => {
    const resData = {};
    try {
        const postNumber = req.query.query;

        executeQuery('SELECT * FROM post_recruit_comments WHERE post_number = ?;',
            [postNumber],
            (err, result) => {
                if (err) {
                    handleDBError(`댓글을 DB에 넣을때 에러 발생: ${err}`);
                    resData.success = false;
                    return res.json(resData);
                }
                resData.success = true;
                resData.commentData = result;
                res.json(resData);
            })
    } catch (error) {
        console.error("댓글 작성 실패", error);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const deleteComment = async (req, res) => {
    const resData = {};
    try {
        const deleteCommentId = req.body;

        executeQuery('UPDATE post_recruit_comments SET is_deleted = ? WHERE comment_id = ?;',
            [1, deleteCommentId.commentId],
            (err, result) => {
                if (err) {
                    handleDBError(`댓글을 삭제 처리할때 에러 발생: ${err}`);
                    resData.success = false;
                    return res.json(resData);
                }
                resData.success = true;
                res.json(resData);
            }
        )
    } catch (error) {
        console.error("댓글 삭제 실패", error);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const updateComment = async (req, res) => {
    const resData = {};
    try {
        const commentData = req.body;

        executeQuery('UPDATE post_recruit_comments SET content = ? WHERE comment_id = ?;',
            [commentData.originalContent, commentData.commentId],
            (err, result) => {
                if (err) {
                    handleDBError(`댓글을 업데이트 할때 에러 발생: ${err}`);
                    resData.success = false;
                    return res.json(resData);
                }
                resData.success = true;
                res.json(resData);
            }
        )
    } catch (error) {
        console.error("댓글 삭제 실패", error);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const addReplyComment = async (req, res) => {
    const resData = {};
    try {
        const childCommentData = req.body;

        const decodedToken = await getTokenDecode(req, res);
        childCommentData.user_id = decodedToken.id;

        executeQuery('INSERT INTO post_recruit_comments (post_number, user_id, parent_comment_id, content) VALUES (?, ?, ?, ?);',
            [childCommentData.postNum, childCommentData.user_id, childCommentData.parentId, childCommentData.content],
            (err, result) => {
                if (err) {
                    handleDBError(`대댓글을 DB에 넣다가 에러 발생: ${err}`);
                    resData.success = false;
                    return res.json(resData);
                }
                resData.success = true;
                return res.json(resData);
            }
        )
    } catch (error) {
        console.error("대댓글 작성 실패", error);
        resData.success = false;
        res.status(500).json(resData);
    }
}

function getCategoryQuery(postNum) {
    return new Promise((resolve, reject) => {
        executeQuery('SELECT category FROM post_recruit WHERE post_number = ?;',
            [postNum],
            (err, result) => {
                if (err) {
                    reject(`해당 게시글의 클럽 카테고리 조회 실패: ${err}`);
                } else{
                    resolve(result[0]);
                }
            });
    });
}

function getClubOwnerQuery(category) {
    return new Promise((resolve, reject) => {
        executeQuery('SELECT club_owner FROM club WHERE category = ?;',
            [category],
            (err, result) => {
                if (err) {
                    reject(`해당 게시글의 카테고리로 클럽 오너 조회중 실패: ${err}`);
                } else{
                    resolve(result[0]);
                }
            });
    });
}

const getClubOwnerId = async (req, res) => {
    const resData = {};
    try {
        const postNum = req.query.query;
        const category = await getCategoryQuery(postNum);
        const clubOwner = await getClubOwnerQuery(category.category);

        resData.success = true;
        resData.clubOwnerId = clubOwner.club_owner;
        return res.json(resData);
    } catch (error) {
        console.error("해당 게시글의 클럽 오너 조회 실패", error);
        resData.success = false;
        res.status(500).json(resData);
    }
}

module.exports = {
    addCommentNew,
    getComment,
    deleteComment,
    updateComment,
    addReplyComment,
    getClubOwnerId,
    getCategoryQuery,
}