const { handleDBError } = require("../login.ctrl");
const { executeQueryPromise } = require("../../config/database.func");

async function searchMember(searchQuery) {
    try {
        const result = await executeQueryPromise(
            `SELECT user_id, user_name, user_student_id, user_department, category FROM member WHERE 
            user_id LIKE ? OR user_name LIKE ? 
            OR user_department LIKE ? OR user_student_id LIKE ?`,
            [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`]
        );

        if (result && result.length === 0) {
            return { success: false };
        } else {
            return { success: true, result };
        }
    } catch (err) {
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

    for (let idx = 0; idx < searchMemberResult.result.length; idx++) {
        const user_id = searchMemberResult.result[idx].user_id;

        try {
            const profileResult = await executeQueryPromise("SELECT * FROM user_profile WHERE user_id = ?", [user_id]);

            if (profileResult.length === 0) {
                userProfileData.userData.push({ hasProfile: false, profile: searchMemberResult.result[idx] });
            } else {
                userProfileData.userData.push({ hasProfile: true, profile: profileResult[0] });
            }
        } catch (err) {
            handleDBError(err);
            userProfileData.success = false;
        }
    }

    return userProfileData;
}

const searchProfileResult = async (req, res) => {
    try {
        const searchQuery = req.query.query;
        const searchMemberResult = await searchMember(searchQuery);
        const userProfileData = await checkUserProfileExists(searchMemberResult);
        res.json(userProfileData);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const searchResult = async (req, res) => {
    try {
        const searchQuery = req.query.query;
        if (searchQuery === "") {
            return res.json({ success: false});
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
