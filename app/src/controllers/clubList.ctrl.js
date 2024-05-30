const { executeQueryPromise } = require("../config/database.func");

// 클럽 데이터를 캐시하는 객체
const clubsCache = {
    central: null,
    community: null,
    academy: null,
    all: null
};

const fetchClubs = async (affilition) => {
    let query;
    if (affilition === 'central') {
        query = `SELECT * FROM club WHERE affilition = '중앙동아리연합'`;
    } else if (affilition === 'community') {
        query = `SELECT * FROM club WHERE affilition = '소모임'`;
    } else if (affilition === 'academy') {
        query = `SELECT * FROM club WHERE affilition NOT IN ('중앙동아리연합', '소모임')`;
    } else {
        query = `SELECT * FROM club`;
    }

    try {
        const rows = await executeQueryPromise(query);
        return rows;
    } catch (error) {
        console.error("데이터베이스에서 동아리 목록을 불러오는 중 오류가 발생했습니다:", error);
        throw error;
    }
}

const sortClubs = (clubs, sortField, sortOrder) => {
    return clubs.sort((a, b) => {
        const x = sortField === 'member_count' ? parseInt(a[sortField]) : a[sortField];
        const y = sortField === 'member_count' ? parseInt(b[sortField]) : b[sortField];

        if (x < y) {
            return sortOrder === 'asc' ? -1 : 1;
        }
        if (x > y) {
            return sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
    });
}

const getClubs = async (req, res) => {
    const resData = {};
    const { sortField = 'club_name', sortOrder = 'asc', searchQuery = '' } = req.query;
    const searchClause = searchQuery.toLowerCase();

    try {
        let clubs;
        if (!searchClause) {
            // 검색어가 없는 경우에만 캐시된 데이터 사용
            clubs = clubsCache.all;
        }
        if (!clubs) {
            clubs = await fetchClubs('all');
            clubsCache.all = clubs; // 캐시 업데이트
        }

        let filteredClubs = clubs;
        if (searchClause) {
            filteredClubs = clubs.filter(club => 
                club.club_name.toLowerCase().includes(searchClause)
            );
        }
        const sortedClubs = sortClubs(filteredClubs, sortField, sortOrder);

        resData.success = true;
        resData.clubsList = sortedClubs;
        res.status(200).json(resData);
    } catch (error) {
        console.error("데이터베이스에서 검색하는 중 오류가 발생했습니다:", error);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const getClubsByAffilition = async (req, res) => {
    const resData = {};
    const { sortField = 'club_name', sortOrder = 'asc', searchQuery = '' } = req.query;
    const affilitionValue = req.params.affilition;
    const searchClause = searchQuery.toLowerCase();

    try {
        let clubs;
        if (!searchClause) {
            // 검색어가 없는 경우에만 캐시된 데이터 사용
            clubs = clubsCache[affilitionValue];
        }
        if (!clubs) {
            clubs = await fetchClubs(affilitionValue);
            clubsCache[affilitionValue] = clubs; // 캐시 업데이트
        }

        let filteredClubs = clubs;
        if (searchClause) {
            filteredClubs = clubs.filter(club => 
                club.club_name.toLowerCase().includes(searchClause)
            );
        }
        const sortedClubs = sortClubs(filteredClubs, sortField, sortOrder);

        resData.success = true;
        resData.clubsList = sortedClubs;
        res.status(200).json(resData);
    } catch (error) {
        console.error("데이터베이스에서 검색하는 중 오류가 발생했습니다:", error);
        resData.success = false;
        res.status(500).json(resData);
    }
}

module.exports = {
    getClubs,
    getClubsByAffilition
};
