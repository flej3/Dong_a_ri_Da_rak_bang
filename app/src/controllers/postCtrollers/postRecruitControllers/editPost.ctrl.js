const { executeQuery } = require("../../../config/database.func");
const { handleDBError } = require("../../../controllers/login.ctrl");
const { getTokenDecode } = require("../../tokenControllers/token.ctrl");
const { verifyClubAdmin, verifyClubMemberAdminAc, getClubCategory } = require("./writePost.ctrl");

const setPostUpdate = async (req, res) => {
    const editPostData = req.body;
    const resData = {};

    const postNum = req.query.query;
    try {
        const decodedToken = await getTokenDecode(req, res);
        const user_id = decodedToken.id;
        const clubCategory = await getClubCategory(editPostData.club_name);

        const isClubOwner = await verifyClubAdmin(user_id, editPostData.club_name);
        const isClubAcminAc = await verifyClubMemberAdminAc(clubCategory, decodedToken.studentId);
        if (!isClubOwner && !isClubAcminAc) {
            resData.isClubAdminAc = false;
            return res.json(resData);
        }
        resData.isClubAdminAc = true;

        executeQuery("UPDATE post_recruit SET title = ?, club_name = ?, content = ?, recruit_num = ?, dead_day = ?, writer = ?, image_route = ?, category = ? WHERE post_number = ?",
            [
                editPostData.title,
                editPostData.club_name,
                editPostData.content,
                editPostData.recruit_num,
                editPostData.dead_day,
                user_id,
                editPostData.image_route,
                clubCategory,
                postNum // 게시글을 식별할 수 있는 고유 ID
            ],
            (err, result) => {
                if (err) {
                    handleDBError(`포스팅 게시글 DB를 업데이트할 때 에러 발생: ${err}`);
                    resData.success = false;
                    return res.json(resData);
                }
                if (result.affectedRows === 0) {
                    // 업데이트할 게시글이 없는 경우
                    console.error("업데이트할 게시글이 존재하지 않습니다.");
                    resData.success = false;
                    return res.json(resData);
                }
                // 성공적으로 업데이트된 경우
                resData.success = true;
                resData.postNum = postNum; // 업데이트된 게시글 ID
                res.json(resData);
            })
    } catch (err) {
        console.error("게시글 편집 실패", err);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const setDeletePost = async (req, res) => {
    const deletePostNumber = req.body;
    const resData = {};

    try {
        executeQuery("DELETE FROM post_recruit WHERE post_number = ?;",
            [deletePostNumber.postNum],
            (err, result) => {
                if (err) {
                    handleDBError(`포스팅 게시글 DB를 업데이트할 때 에러 발생: ${err}`);
                    resData.success = false;
                    return res.json(resData);
                }
                if (result.affectedRows === 0) {
                    // 삭제할 게시글이 없는 경우
                    console.error("삭제할 게시글이 존재하지 않습니다.");
                    resData.success = false;
                    return res.json(resData);
                }
                // 성공적으로 삭제된 경우
                resData.success = true;
                res.json(resData);
            })
    } catch (err) {
        console.error("게시글 편집 실패", err);
        resData.success = false;
        res.status(500).json(resData);
    }
}

async function getPostCategory(post_number) {
    return new Promise((resolve, reject) => {
        executeQuery('SELECT category FROM post_recruit WHERE post_number=?;',
            [post_number],
            (err, result) => {
                if (err) {
                    handleDBError(err);
                    return reject(err);
                }
                if (result.length === 0) {
                    const error = new Error('No category found for the specified post number.');
                    return reject(error);
                }
                resolve(result[0].category);
            }
        )
    })
}

//해당 게시글의 편집모드로 들어갈때 접속자가 해당 게시글의 Owner인지 확인
async function isPostClubOwner(category, user_id) {
    return new Promise((resolve, reject) => {
        executeQuery('SELECT club_owner FROM club WHERE category = ? AND club_owner = ?;',
            [category, user_id],
            (err, result) => {
                if (err) {
                    handleDBError(err);
                    return reject(err);
                }
                if (result.length === 0) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            })
    })
}

async function isPostAdminAc(category, userId) {
    return new Promise((resolve, reject) => {
        executeQuery('SELECT admin_ac FROM club_member WHERE category = ? AND user_id = ?;',
            [category, userId],
            (err, result) => {
                if (err) {
                    handleDBError(err);
                    return reject(err);
                }
                if (result.length === 0 || result[0].admin_ac === 0) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            })
    })
}

//해당 게시글의 편집모드로 들어갈때, 접속자가 해당 게시글의 권한자(owner || admin_ac)인지 확인
const verifyEditAccess = async (req, res) => {
    try {
        const decodedToken = await getTokenDecode(req, res);
        const user_id = decodedToken.id;
        const query = req.query.query;

        const category = await getPostCategory(query);
        const checkPostClubOwner = await isPostClubOwner(category, user_id);
        const checkPostAdminAc = await isPostAdminAc(category, user_id);

        if (!checkPostClubOwner && !checkPostAdminAc) {
            return res.json({ isAccess: false });
        }
        res.json({ isAccess: true });

    } catch (error) {
        console.error("권한자 조회중 에러발생:", error);
        return res.json({ isAccess: false });
    }
}

module.exports = {
    setPostUpdate,
    verifyEditAccess,
    setDeletePost,
}