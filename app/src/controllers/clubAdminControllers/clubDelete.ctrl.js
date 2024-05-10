const { executeQueryPromise } = require("../../config/database.func");
const { getTokenDecode } = require("../../controllers/tokenControllers/token.ctrl");

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
        resData.haslogClubOwner = true;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`해당 동아리 대표인지를 체크중 에러발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

module.exports = {
    thisClubOwnerCheck,
}