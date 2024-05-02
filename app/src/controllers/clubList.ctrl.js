const { executeQueryPromise } = require("../config/database.func");

const getClubs = async (req, res) => {
    const resData = {};
    try {
        const rows = await executeQueryPromise
        ("SELECT *  FROM club", []);
        resData.success = true;
        resData.clubsList = rows;
        res.status(200).json(resData);
    } catch (error) {
        console.error("데이터베이스에서 검색하는 중 오류가 발생했습니다.:", error);
        resData.success = false;
        res.status(500).json(resData);
    }
}

module.exports = {
    getClubs,
};