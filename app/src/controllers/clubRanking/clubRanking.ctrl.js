const { executeQueryPromise } = require("../../config/database.func");

const getClubRankingList = async (req, res) => {
    const resData = {};
    try {
        const query = `SELECT * FROM club_likes;`;
        const clubLikesList = await executeQueryPromise(query);
        
        const categoryCounts = clubLikesList.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = 0;
            }
            acc[item.category]++;
            return acc;
        }, {});

        const sortedCategoryCounts = Object.entries(categoryCounts)
            .map(([category, count]) => ({ category: Number(category), count }))
            .sort((a, b) => b.count - a.count);

        const clubs = await getClub();

        const enrichedCategoryCounts = sortedCategoryCounts.map(item => {
            const club = clubs.find(club => club.category === item.category);
            return {
                ...item,
                club_name: club ? club.club_name : 'Unknown'
            };
        });

        resData.success = true;
        resData.rankingList = enrichedCategoryCounts;
        resData.fullClubList = clubs;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`동아리의 좋아요 리스트를 불러오는중 에러 발생: ${error}`)
        resData.success = false;
        res.status(500).json(resData);
    }
}

async function getClub(){
    try {
        const query = `SELECT club_name, category FROM club;`;
        const clubs = await executeQueryPromise(query);

        return clubs;
    } catch (error) {
        console.error(`동아리 이름 목록 리스트를 불러오는중 에러 발생: ${error}`)
    }
}

module.exports = {
    getClubRankingList,
}