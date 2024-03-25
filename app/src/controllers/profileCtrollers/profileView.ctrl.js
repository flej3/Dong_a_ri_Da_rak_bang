const { executeQuery } = require("../../config/database.func");
const { getTokenDecode } = require("../tokenControllers/token.ctrl");
const { handleDBError } = require("../login.ctrl");

const getUserProfile = async (req, res) => {
    try {
        const accessTokenDecoded = await getTokenDecode(req, res);

        executeQuery(
            "SELECT * FROM user_profile WHERE user_id = ?",
            [accessTokenDecoded.id],
            (err, result) => {
                if (err) {
                    handleDBError(err);
                    res.json({ success: false });
                } else {
                    if (result.length > 0) {
                        res.json({ success: true, userProfile: result[0] });
                    } else {
                        res.json({ success: false });
                    }
                }
            }
        );
    } catch (error) {
        handleDBError(error);
        res.json({ success: false });
    }
};

module.exports = {
    getUserProfile,
}