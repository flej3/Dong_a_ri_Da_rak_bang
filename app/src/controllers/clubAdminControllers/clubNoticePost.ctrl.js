const { executeQueryPromise } = require("../../config/database.func");
const { getTokenDecode } = require("../../controllers/tokenControllers/token.ctrl");
const { isClubOwner } = require("../index.ctrl");

const postClubNoticePost = async (req, res) => {
    const resData = {};
    try {
        const { title, content, category } = req.body;
        const tokenDecoded = await getTokenDecode(req, res);
        const writer = tokenDecoded.id;

        const query = `INSERT INTO post_notice (category, content, writer, title) value (?, ?, ?, ?);`;
        await executeQueryPromise(query, [category, content, writer, title]);

        resData.success = true;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`클럽 공지사항을 저장하는 쿼리 동작중 에러발생 ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const getClubNoticePost = async (req, res) => {
    const resData = {};
    try {
        const category = req.query.query;
        const query = `SELECT * FROM post_notice WHERE category = ?;`;
        const noticeList = await executeQueryPromise(query, [category]);

        resData.success = true;
        resData.noticeList = noticeList;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`클럽 공지사항을 가져오는 쿼리 동작중 에러발생 ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const getDetailNotice = async (req, res) => {
    const resData = {};
    try {
        const postNum = req.query.query;
        const query = `SELECT * FROM post_notice WHERE post_number = ?;`;
        const noticeData = await executeQueryPromise(query, [postNum]);
        resData.success = true;
        resData.noticeData = noticeData;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`클럽 공지 세부 사항 가져오는 쿼리 동작중 에러발생 ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const hasClubAdminAc = async (req, res) => {
    const resData = {};
    try {
        const category = req.query.query;
        const tokenDecoded = await getTokenDecode(req, res);
        const userId = tokenDecoded.id;

        const query = `SELECT * FROM club_member WHERE user_id = ? AND category = ? AND admin_ac = ?;`;
        const result = await executeQueryPromise(query, [userId, category, '1']);

        if(result.length === 0){
            resData.hasAdminAc = false;
            res.status(200).json(resData);
            return ;
        }
        resData.hasAdminAc = true;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`동아리 권한자 확인중 에러 발생 ${error}`);
        resData.hasAdminAc = false;
        res.status(500).json(resData);
    }
}

const updateClubNotice = async (req, res) => {
    const resData = {};
    try {
        const {postNum, title, content} = req.body;
        const tokenDecoded = await getTokenDecode(req, res);
        const userId = tokenDecoded.id;
        const query = `UPDATE post_notice SET title = ?, content = ?, writer = ? WHERE post_number = ?;`;

        await executeQueryPromise(query, [title, content, userId, postNum]);
        resData.success = true;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`동아리 공지 사항 업데이트중 에러 발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const deleteClubNotice = async (req, res) => {
    const resData = {};
    try {
        const {postNum} = req.body;
        const query = `DELETE FROM post_notice WHERE post_number = ?;`;
        await executeQueryPromise(query, [postNum]);
        resData.success = true;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`동아리 공지 사항 삭제중 에러 발생: ${error}`);
        resData.success = false;
        res.status(200).json(resData);
    }
}

const clubOwnerCheck = async (req, res) => {
    const resData = {};
    try {
        const tokenDecoded = await getTokenDecode(req, res);
        const { isOwner } = await isClubOwner(tokenDecoded.id);
        if(!isOwner){
            resData.success = false;
            res.status(200).json(resData);
            return;
        }
        resData.success = true;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`동아리 대표 확인중 에러 발생: ${error}`);
        resData.success = false;
        res.status(200).json(resData);
    }
}

module.exports = {
    postClubNoticePost,
    getClubNoticePost,
    getDetailNotice,
    hasClubAdminAc,
    updateClubNotice,
    deleteClubNotice,
    clubOwnerCheck,
}