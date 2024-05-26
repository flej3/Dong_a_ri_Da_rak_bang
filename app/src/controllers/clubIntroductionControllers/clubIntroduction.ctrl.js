const { executeQueryPromise } = require("../../config/database.func");

const getClubIntroduction = async (req, res) => {
    const resData = {};
    try {
        const category = req.query.category;
        const query = `SELECT * FROM club WHERE category = ?;`;
        const clubIntroData = await executeQueryPromise(query, [category]);
        resData.success = true;
        resData.clubIntroData = clubIntroData[0];
        res.status(200).json(resData);
    } catch (error) {
        console.error(`클럽 소개 정보를 불러오던중 에러 발생 ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const saveClubIntroEdit = async (req, res) => {
    const resData = {};
    try {
        const {profile_img_route, about, twitter, facebook, instagram, category} = req.body;
        const query = `UPDATE club SET profile_img_route = ?, about = ?, twitter_link = ?, facebook_link = ?, instagram_link = ? WHERE category = ?; `;

        await executeQueryPromise(query, [profile_img_route, about, twitter, facebook, instagram, category]);

        resData.success = true;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`클럽 소개 정보를 저장하던중 에러 발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const getClubDataForGraph = async (req, res) => {
    const resData = {};
    try {
        const category = req.query.category;
        const query = `SELECT * FROM club_member WHERE category = ?;`;
        const clubData = await executeQueryPromise(query, [category]);
        resData.success = true;
        res.status(200).json(clubData);
    } catch (error) {
        console.error(`클럽 회원 정보를 불러오던 중 에러 발생 ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

module.exports = {
    getClubIntroduction,
    saveClubIntroEdit,
    getClubDataForGraph,
}