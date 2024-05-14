const {executeQuery, executeQueryPromise} = require("../config/database.func");
const {getTokenDecode} = require("../controllers/tokenControllers/token.ctrl");
const {handleDBError} = require("./login.ctrl");

const getUserComment = async (req, res) => {
    const decodedData = await getTokenDecode(req, res);
    const userId = decodedData.id;
    try {
        const result = await executeQueryPromise("SELECT pr.title, prc.* FROM post_recruit_comments AS prc JOIN post_recruit AS pr ON prc.post_number = pr.post_number WHERE prc.user_id = ? ORDER BY prc.created_at DESC;", [userId]);

        if (result.length === 0) {
            return res.json({ error: "No results found" });
        } else {
            return res.json({ success: true, result: result });
        }
    } catch (error) {
        handleDBError(error, conn);
        return res.status(500).json({ error: "Database error" });
    }
}

const getUserLike = async (req, res) => {
    const decodedData = await getTokenDecode(req, res);
    const userId = decodedData.id;
    try {
        const result = await executeQueryPromise("SELECT * FROM clubdb.club_likes cll JOIN clubdb.club cl ON cll.category = cl.category WHERE cll.user_id = ?;", [userId]);

        if (result.length === 0) {
            return res.json({ error: "No results found" });
        } else {
            return res.json({ success: true, result: result });
        }
    } catch (error) {
        handleDBError(error, conn);
        return res.status(500).json({ error: "Database error" });
    }
}

const getUserLikePost = async (req, res) => {
    const decodedData = await getTokenDecode(req, res);
    const userId = decodedData.id;
    try {
        const result = await executeQueryPromise("SELECT ul.user_id,ul.post_number,pr.* FROM user_likes ul JOIN post_recruit pr ON ul.post_number = pr.post_number WHERE ul.user_id = ? ORDER BY pr.create_day DESC;", [userId]);

        if (result.length === 0) {
            return res.json({ error: "No results found" });
        } else {
            return res.json({ success: true, result: result });
        }
    } catch (error) {
        handleDBError(error, conn);
        return res.status(500).json({ error: "Database error" });
    }
}

module.exports = {
    getUserLike,
    getUserLikePost,
    getUserComment,
}