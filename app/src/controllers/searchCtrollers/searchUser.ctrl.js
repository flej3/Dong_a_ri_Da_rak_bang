const { handleDBError } = require("../login.ctrl");
const { executeQueryPromise } = require("../../config/database.func");

async function searchMember(searchQuery) {
    try {
        const result = await executeQueryPromise(
            `SELECT user_id, user_name, user_student_id, user_department FROM member WHERE 
            user_id LIKE ? OR user_name LIKE ? 
            OR user_department LIKE ? OR user_student_id LIKE ?`,
            [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`]
        );

        if (result.length === 0) {
            return { success: false };
        } else {
            return { success: true, result };
        }
    } catch (err) {
        handleDBError(err);
        return { success: false };
    }
}

async function getUserFromMember(userId) {
    try {
        const result = await executeQueryPromise(
            `SELECT user_id, user_name, user_student_id, user_department FROM member WHERE
            user_id = ?`,
            [userId]
        );
        if (result.length === 0) {
            return { success: false };
        }
        else {
            return { success: true, result };
        }
    } catch (error) {
        handleDBError(err);
        return { success: false };
    }
}

async function checkUserProfileExists(searchMemberResult) {
    const userProfileData = { success: true, userData: [] };

    if (!searchMemberResult.success) {
        userProfileData.success = false;
        return userProfileData;
    }
    const user_id = searchMemberResult.result[0].user_id;
    
    try {
        const profileResult = await executeQueryPromise("SELECT * FROM user_profile WHERE user_id = ?", [user_id]);

        if (profileResult.length === 0) {
            userProfileData.userData.push({ hasProfile: false, userData: searchMemberResult.result[0] });
        } else {
            userProfileData.userData.push({ hasProfile: true, userData: searchMemberResult.result[0], profile: profileResult[0] });
        }
    } catch (err) {
        handleDBError(err);
        userProfileData.success = false;
    }

    return userProfileData;
}

const searchProfileResult = async (req, res) => {
    try {
        const searchQueryUserId = req.query.query;
        const userFromMember = await getUserFromMember(searchQueryUserId);
        const userProfileData = await checkUserProfileExists(userFromMember);
        res.json(userProfileData);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const searchResult = async (req, res) => {
    try {
        const searchQuery = req.query.query;
        if (searchQuery === "") {
            return res.json({ success: false });
        }
        const searchMemberResult = await searchMember(searchQuery);
        res.json(searchMemberResult);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    searchProfileResult,
    searchResult,
};
