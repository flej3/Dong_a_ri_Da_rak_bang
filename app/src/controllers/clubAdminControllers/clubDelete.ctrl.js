const { executeQueryPromise } = require("../../config/database.func");
const { getTokenDecode } = require("../../controllers/tokenControllers/token.ctrl");
const bcrypt = require("bcrypt");

const thisClubOwnerCheck = async (req, res) => {
    const resData = {};
    try {
        const category = req.query.category;
        const { id } = await getTokenDecode(req, res);
        const query = `SELECT * FROM club WHERE category = ? AND club_owner = ?;`;
        const isClubOwner = await executeQueryPromise(query, [category, id]);

        if(isClubOwner.length === 0){
            resData.success = true;
            resData.hasClubOwner = false;
            res.status(200).json(resData);
            return;
        }
        resData.success = true;
        resData.hasClubOwner = true;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`해당 동아리 대표인지를 체크중 에러발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const checkClubOwnerPw = async (req, res) => {
    const resData = {};
    try {
        const { pw, category } = req.body;
        const accessTokenDecoded = await getTokenDecode(req, res);

        const getClubOwnerIdQuery = `SELECT club_owner FROM club WHERE category = ?;`;
        const clubOwnerId = await executeQueryPromise(getClubOwnerIdQuery, [category]);
        
        const getUserData = `SELECT * FROM member WHERE user_id = ?;`;
        const userData = await executeQueryPromise(getUserData, [accessTokenDecoded.id]);

        if(clubOwnerId[0].club_owner !== userData[0].user_id){
            resData.success = false;
            resData.msg = '동아리 회장과 로그인된 ID가 다릅니다.';
            res.status(200).json(resData);
            return;
        }

        const isMatch = await bcrypt.compare(pw, userData[0].user_pw);
        
        if (!isMatch) {
            resData.success = false;
            resData.msg = '비밀번호를 다시 확인해주세요.';
            res.status(200).json(resData);
            return;
        }

        resData.success = true;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`동아리 삭제를 위한 비밀번호 조회중 에러 발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const deleteClub = async (req, res) => {
    const resData = {};
    try {
        const { category } = req.body;
        const accessTokenDecoded = await getTokenDecode(req, res);
        
        const query = `DELETE FROM club WHERE club_owner = ? AND category = ?;`;
        await executeQueryPromise(query, [accessTokenDecoded.id, category]);

        resData.success = true;
        resData.msg = `동아리를 삭제 하였습니다!`;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`동아리를 삭제하는 쿼리 진행중 에러 발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

module.exports = {
    thisClubOwnerCheck,
    checkClubOwnerPw,
    deleteClub,
}