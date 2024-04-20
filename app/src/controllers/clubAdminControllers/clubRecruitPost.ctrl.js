const { executeQueryPromise } = require("../../config/database.func");

const getClubRecruitPostList = async (req, res) => {
    const resData = {};
    try {
        const category = req.query.query;
        const query = `SELECT post_number, title, club_name, recruit_num, create_day, dead_day, writer FROM post_recruit WHERE category = ?;`;
        const postRecruitList = await executeQueryPromise(query, [category]);

        resData.success = true;
        resData.recruitPostList = postRecruitList;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`현재 동아리의 모집 공고 리스트를 불러오던중 에러 발생 ${err}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

module.exports = {
    getClubRecruitPostList,
}