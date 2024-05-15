const { executeQueryPromise } = require("../../config/database.func");
const { getTokenDecode } = require("../../controllers/tokenControllers/token.ctrl");

const getClubLikes = async (req, res) => {
    const resData = {};
    try {
        const { id } = await getTokenDecode(req, res);
        const query = `SELECT * FROM club_likes WHERE user_id = ?;`;
        const clubLikes = await executeQueryPromise(query, [id]);
        resData.clubLikes = clubLikes;
        resData.success = true;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`동아리들의 "좋아요" 조회중 에러 발생: ${error}`)
        resData.success = false;
        res.status(500).json(resData);
    }
}

const addClubLike = async (req, res) => {
    const resData = {};
    try {
        const { category } = req.body;
        const { id } = await getTokenDecode(req, res);
        const query = `INSERT INTO club_likes (user_id, category) VALUES (?, ?);`;
        await executeQueryPromise(query, [id, category]);
        resData.success = true;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`특정 동아리의 "좋아요" 추가중 에러 발생: ${error}`)
        resData.success = false;
        res.status(500).json(resData);
    }
}

const deleteClubLike = async (req, res) => {
    const resData = {};
    try {
        const { category } = req.body;
        const { id } = await getTokenDecode(req, res);
        const query = `DELETE FROM club_likes WHERE user_id = ? AND category = ?;`;
        await executeQueryPromise(query, [id, category]);
        resData.success = true;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`특정 동아리의 "좋아요" 삭제중 에러 발생: ${error}`)
        resData.success = false;
        res.status(500).json(resData);
    }
}

const getClubLike = async (req, res) => {
    const resData = {};
    try {
        const category = req.query.category;
        const { id } = await getTokenDecode(req, res);
        const query = `SELECT * FROM club_likes WHERE user_id = ? AND category = ?;`;
        const clubLike = await executeQueryPromise(query, [id, category]);
        if(clubLike.length === 0){
            resData.success = true;
            resData.isClubLike = false;
            res.status(200).json(resData);
            return;
        }
        resData.success = true;
        resData.isClubLike = true;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`특정 동아리의 "좋아요" 조회중 에러 발생: ${error}`)
        resData.success = false;
        res.status(500).json(resData);
    }
}

const getClubLikesCount = async (req, res) =>{
    const resData = {};
    try {
        const category = req.query.category;
        const query = `SELECT * FROM club_likes WHERE category = ?;`;
        const clubLikes = await executeQueryPromise(query, [category]);
        resData.success = true;
        resData.clubLikesCount = clubLikes.length;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`동아리의 "좋아요" 개수를 조회중 에러 발생: ${error}`)
        resData.success = false;
        res.status(500).json(resData);
    }
}

module.exports = {
    getClubLikes,
    addClubLike,
    deleteClubLike,
    getClubLike,
    getClubLikesCount,
}