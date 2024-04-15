const { executeQuery, executeQueryPromise } = require("../../../../config/database.func");
const { handleDBError } = require("../../../../controllers/login.ctrl");
const { getTokenDecode } = require("../../../tokenControllers/token.ctrl");

async function getClubData(category) {
    const query = `SELECT * FROM club WHERE category = ?;`;
    try {
        const result = await executeQueryPromise(query, [category]);
        return result[0];
    } catch (error) {
        handleDBError(`카테고리로 클럽데이터 조회중 오류 발생: ${error}`);
    }
}

const getClubApplicationsListForIndex = async (req, res) => {
    const resData = { success: false, clubApplicationData: [] };
    try {
        const decodedToken = await getTokenDecode(req, res);
        const query = `SELECT * FROM club_applications WHERE user_id = ?;`;

        const result = await executeQueryPromise(query, [decodedToken.id]);
        if (result.length === 0) {
            resData.success = false;
            return res.json(resData);
        }
        resData.success = true;

        for (let idx = 0; idx < result.length; idx++) {
            const clubData = await getClubData(result[idx].category);
            const applicationDate = new Date(result[idx].application_date).toISOString().split('T')[0]; // ISO 문자열에서 날짜 부분만 추출
            const clubApplicationInfo = {
                application_id: result[idx].application_id,
                club_name: clubData.club_name,
                club_owner: clubData.club_owner,
                create_day: applicationDate, // 날짜 형식 변경
                status: result[idx].application_status,
            };
            resData.clubApplicationData.push(clubApplicationInfo);
        }
        res.json(resData);
    } catch (error) {
        handleDBError(`가입 신청중인 목록 가져오는중 에러 발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const cancelApplication = (req, res) => {
    const resData = {};
    const { applicationId } = req.body;
    const query = `DELETE FROM club_applications WHERE application_id = ?;`;

    executeQuery(query, [applicationId],
        (err, result) => {
            if (err) {
                handleDBError(`클럽 신청서 취소중 쿼리에서 에러 발생: ${err}`);
                resData.success = false;
                res.status(500).json(resData);
                return;
            }
            resData.success = true;
            res.json(resData);
        })
}

module.exports = {
    getClubApplicationsListForIndex,
    cancelApplication,
}