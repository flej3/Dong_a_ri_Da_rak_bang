const { getTokenDecode } = require("../../../controllers/tokenControllers/token.ctrl");
const { executeQueryPromise } = require("../../../config/database.func");

const getClubData = async (req, res) => {
    const resData = {};

    try {
        const category = req.query.category;

        const query = `SELECT * FROM club WHERE category = ?;`;
        const clubData = await executeQueryPromise(query, [category]);

        resData.success = true;
        resData.clubData = clubData[0];
        res.status(200).json(resData);
    } catch (error) {
        console.error(`동아리 정보를 가져오는중 에러 발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const checkClubOwner = async (req, res) => {
    const resData = {};
    try {
        const category = req.query.category;
        const tokenDecoded = await getTokenDecode(req, res);
        const userId = tokenDecoded.id;
        const query = `SELECT * FROM club WHERE category = ? AND club_owner = ?;`;

        const result = await executeQueryPromise(query, [category, userId]);
        if(result.length !== 0){
            resData.isClubOwner = true;
            res.status(200).json(resData);
            return;
        }

        resData.isClubOwner = false;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`해당 동아리의 회장인지 확인중 에러발생: ${error}`);
        resData.isClubOwner = false;
        res.status(500).json(resData);
    }
}

const removeUserFromClub = async (req, res) => {
    const resData = {};
    try {
        const tokenDecoded = await getTokenDecode(req, res);
        const userId = tokenDecoded.id;
        const { category } = req.body;
        const query = `DELETE FROM club_member WHERE category = ? AND user_id = ?;`;
        
        await executeQueryPromise(query, [category, userId]);

        resData.success = true;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`동아리 탈퇴중에 에러발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

module.exports = {
    getClubData,
    removeUserFromClub,
    checkClubOwner,
}