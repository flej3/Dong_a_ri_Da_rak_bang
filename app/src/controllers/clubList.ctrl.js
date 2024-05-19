const { executeQueryPromise } = require("../config/database.func");

const getClubs = async (req, res) => {
    const resData = {};
    const { sort } = req.query;
    let orderByClause = '';

    if (sort === 'asc') {
        orderByClause = 'ORDER BY club_name ASC';
    } else if (sort === 'desc') {
        orderByClause = 'ORDER BY club_name DESC';
    }

    try {
        const rows = await executeQueryPromise(`SELECT * FROM club ${orderByClause}`, []);
        resData.success = true;
        resData.clubsList = rows;
        res.status(200).json(resData);
    } catch (error) {
        console.error("데이터베이스에서 검색하는 중 오류가 발생했습니다.:", error);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const getClubsByAffilition = async (req, res) => {
    const resData = {};
    const { sort } = req.query;
    const affilitionValue = req.params.affilition;
    let query;
    let params = [];
    let orderByClause = '';

    if (sort === 'asc') {
        orderByClause = 'ORDER BY club_name ASC';
    } else if (sort === 'desc') {
        orderByClause = 'ORDER BY club_name DESC';
    }

    if (affilitionValue === 'central') {
        query = `SELECT * FROM club WHERE affilition = '중앙동아리연합' ${orderByClause}`;
    } else if (affilitionValue === 'community') {
        query = `SELECT * FROM club WHERE affilition = '소모임' ${orderByClause}`;
    } else if (affilitionValue === 'academy') {
        query = `SELECT * FROM club WHERE affilition NOT IN ('중앙동아리연합', '소모임') ${orderByClause}`;
    } else {
        query = `SELECT * FROM club ${orderByClause}`;
    }

    try {
        const rows = await executeQueryPromise(query, params);
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
    getClubsByAffilition
};
