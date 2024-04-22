const { executeQueryPromise } = require("../config/database.func");

async function getClubs() {
    try {
        const rows = await executeQueryPromise
        ("SELECT club_name, club_owner, member_count, affilition  FROM club", []);
        
        if (!Array.isArray(rows) || rows.length === 0) {
            console.error("database에서 정보를 찾을 수 없습니다.");
            return [];
        }

        return rows;
    } catch (error) {
        console.error("데이터베이스에서 검색하는 중 오류가 발생했습니다.:", error);
        throw error;
    }
}

module.exports = {
    getClubs
};