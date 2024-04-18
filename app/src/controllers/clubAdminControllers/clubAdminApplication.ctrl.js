const { executeQueryPromise } = require("../../config/database.func");
const { getTokenDecode } = require("../../controllers/tokenControllers/token.ctrl");
const { formatDate } = require("../create-club.ctrl");

async function getMemberData(userId){
    try {
        const userDataQuery = `SELECT user_id, user_name, user_student_id, user_department, user_ph_number FROM member WHERE user_id = ?`;
        let memberData = await executeQueryPromise(userDataQuery, [userId]);
        memberData = memberData[0];
        return memberData;
    } catch (error) {
        console.error(`member 테이블의 회원정보 조회중 에러발생: ${error}`);
    }
}

const clubApplication = async (req, res) => {
    const resData = {};
    try {
        const category = req.query.query;
        const query = `SELECT * FROM club_applications WHERE category = ?;`;
        const applications = await executeQueryPromise(query, [category]);

        const applicationsWithUserData = await Promise.all(applications.map(async (application) => {
            const userData = await getMemberData(application.user_id);
            return { ...application, ...userData };
        }));

        resData.success = true;
        resData.clubApplicationList = applicationsWithUserData;

        res.status(200).json(resData);
    } catch (error) {
        console.error(`동아리 신청 정보 조회중 에러발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const clubApplicationStatusUpdate = async (req, res) => {
    const resData = {};
    try {
        const date = formatDate();
        const updateData = req.body;
        const {
            application_id,
            user_id,
            category,
            user_name,
            user_student_id,
            user_department,
            user_ph_number
        } = updateData.applicationDetail;

        if(await isUserRegistered(user_student_id, category)){
            updateData.status = '거절됨';
            resData.isUserMember = true;
        }

        const statusQuery = `UPDATE club_applications SET application_status = ?, processed_date = ? WHERE application_id = ?`;
        
        await executeQueryPromise(statusQuery, [updateData.status, date, application_id]);
        
        if(updateData.status === '승인됨'){
            const addClubMemberQuery = `INSERT INTO club_member (category, user_id, member_name, member_student_id, member_department, member_ph_number, position, admin_ac) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            await executeQueryPromise(addClubMemberQuery, [category, user_id, user_name, user_student_id, user_department, user_ph_number, '부원', '0']);
        }
        resData.success = true;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`동아리 가입 신청서 처리중에 에러 발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

async function isUserRegistered(studentId, category){
    try {
        const checkQuery = `SELECT * FROM club_member WHERE member_student_id = ? AND category = ?;`;
        const result = await executeQueryPromise(checkQuery, [studentId, category]);

        if(result.length === 0) return false;
        return true;
    } catch (error) {
        console.error(`이미 가입된 유저인지 체크하는중에 에러발생: ${error}`);
    }
}

module.exports = {
    clubApplication,
    clubApplicationStatusUpdate,
}