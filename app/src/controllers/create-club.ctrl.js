const { executeQuery, executeQueryPromise } = require("../config/database.func");
const { handleDBError } = require("../controllers/login.ctrl");
const { getTokenDecode } = require("../controllers/tokenControllers/token.ctrl");

const setCreateClub = async (req, res) => {
    const resData = {};
    try {
        const createClubData = req.body;
        const decodedToken = await getTokenDecode(req, res);
        createClubData.user_id = decodedToken.id;
        createClubData.user_name = decodedToken.name;
        resData.success = true;

        const { user_id, user_name, club_name, club_members, affilition, ph_number, club_content } = createClubData;

        const query = `INSERT INTO club_create_applications (user_id, user_name, club_name, member_count, affilition, user_ph_number, club_content) VALUES (?, ?, ?, ?, ?, ?, ?);`;
        await executeQueryPromise(query, [user_id, user_name, club_name, club_members, affilition, ph_number, club_content]);
        
        resData.success = true;
        res.json(resData);
    } catch (error) {
        console.error(`클럽 신청서를 DB에 넣는중에 에러발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

module.exports = {
    setCreateClub,
}