const { executeQuery } = require("../../config/database.func");
const { getTokenDecode } = require("../tokenControllers/token.ctrl");
const { handleDBError } = require("../login.ctrl");

const checkAndFetchUserProfile = async (req, res) => {
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

const updateUserProfile = async (req, res) => {
    try {
        const accessTokenDecoded = await getTokenDecode(req, res);
        const {
            profile_img_route, //프로필 이미지 아직 미구현
            about,
            joined_clubs,
            twitter_link,
            facebook_link,
            instagram_link,
        } = req.body;
        const user_id = accessTokenDecoded.id;

        // user_id를 기준으로 UPSERT 쿼리 실행
        executeQuery(
            `INSERT INTO user_profile (user_id, profile_img_route, about, joined_clubs, twitter_link, facebook_link, instagram_link)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            profile_img_route = VALUES(profile_img_route),
            about = VALUES(about),
            joined_clubs = VALUES(joined_clubs),
            twitter_link = VALUES(twitter_link),
            facebook_link = VALUES(facebook_link),
            instagram_link = VALUES(instagram_link)`,
            [
                user_id,
                profile_img_route, //프로필 이미지 아직 미구현
                about,
                joined_clubs,
                twitter_link,
                facebook_link,
                instagram_link,
            ],
            (err, result) => {
                if (err) {
                    handleDBError(err);
                    res.json({ success: false, message: "편집중에 오류가 발생했습니다." });
                } else {
                    res.json({ success: true, message: "프로필 편집이 되었습니다." });
                }
            }
        );
    } catch (error) {
        handleDBError(error);
        res.json({ success: false, message: "편집중에 오류가 발생했습니다." });
    }
};

module.exports = {
    checkAndFetchUserProfile,
    updateUserProfile,
}