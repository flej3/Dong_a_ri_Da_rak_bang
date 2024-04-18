const { executeQueryPromise } = require("../config/database.func");
const { handleDBError } = require("../controllers/login.ctrl");
const { getTokenDecode } = require("../controllers/tokenControllers/token.ctrl");

const setCreateClub = async (req, res) => {
    const resData = {};
    try {
        const createClubData = req.body;
        const decodedToken = await getTokenDecode(req, res);
        createClubData.user_id = decodedToken.id;
        createClubData.user_name = decodedToken.name;
        resData.success = true;

        const { user_id, user_name, club_name, club_members, affilition, ph_number, club_content } = createClubData;

        const query = `INSERT INTO club_create_applications (user_id, user_name, club_name, member_count, affilition, user_ph_number, club_content) VALUES (?, ?, ?, ?, ?, ?, ?);`;
        await executeQueryPromise(query, [user_id, user_name, club_name, club_members, affilition, ph_number, club_content]);

        resData.success = true;
        res.json(resData);
    } catch (error) {
        console.error(`클럽 신청서를 DB에 넣는중에 에러발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const getCreateClubList = async (req, res) => {
    const resData = {};
    try {
        const decodedToken = await getTokenDecode(req, res);

        const query = `SELECT * FROM club_create_applications WHERE user_id = ?;`;
        const result = await executeQueryPromise(query, [decodedToken.id]);

        if (result.length === 0) {
            resData.success = true;
            resData.hasClubList = false;
            res.status(200).json(resData);
            return;
        }

        resData.success = true;
        resData.hasClubList = true;
        resData.CreateClubList = result;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`동아리 등록 신청 리스트를 가져오던중 에러발생: ${error}`);
        resData.success = false;
        resData.hasClubList = false;
        res.status(500).json(resData);
    }
}

const deleteClubApplication = async (req, res) => {
    const resData = {};
    try {
        const { applicationId } = req.body;
        const query = `DELETE FROM club_create_applications WHERE club_application_id = ?;`;

        const result = await executeQueryPromise(query, [applicationId]);

        resData.success = true;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`동아리 등록 신청을 취소하던중 에러 발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const getCreateClubApplicationListData = async (req, res) => {
    const resData = {};
    try {
        const query = `SELECT * FROM club_create_applications`;
        const result = await executeQueryPromise(query);

        if (result.length === 0) {
            resData.success = true;
            resData.hasClubList = false;
            res.status(200).json(resData);
            return;
        }

        resData.success = true;
        resData.hasClubList = true;
        resData.CreateClubList = result;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`동아리 등록 신청 리스트를 가져오던중 에러발생: ${error}`);
        resData.success = false;
        resData.hasClubList = false;
        res.status(500).json(resData);
    }
}

//application_id에 해당하는 한개의 row 데이터만 가져옴.
const getCreateClubApplicationData = async (req, res) => {
    const resData = {};
    try {
        const applicationId = req.body;
        const query = `SELECT * FROM club_create_applications WHERE club_application_id = ?;`;
        const result = await executeQueryPromise(query, [applicationId.clubApplicationId]);

        if (result.length === 0) {
            resData.success = false;
            res.status(500).json(resData);
            return;
        }
        resData.success = true;
        resData.CreateClubData = result[0];
        res.status(200).json(resData);
    } catch (error) {
        console.error(`동아리 등록 신청 세부정보를 가져오던중 에러발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

function formatDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}

const updateStatus = async (req, res) => {
    const resData = {};
    try {
        const date = formatDate();
        const applicationData = req.body;

        const query = `UPDATE club_create_applications SET application_status = ?, processed_date = ? WHERE club_application_id = ?;`;
        const result = await executeQueryPromise(query, [applicationData.status, date, applicationData.applicationId]);
        
        await addClub(applicationData);
        
        resData.success = true;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`동아리 등록 신청의 신청 상태를 변경하던중 에러발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

async function addClub(clubApplication){
    try {
        if(clubApplication.status === '거절됨'){
            return;
        }

        const getApplicationQeury = `SELECT * FROM club_create_applications WHERE club_application_id = ?;`;
        let applicationData = await executeQueryPromise(getApplicationQeury, [clubApplication.applicationId]);
        applicationData = applicationData[0];

        const availableCategory = await getLastCategory();
        const addClubQuery = `INSERT INTO club (club_name, club_owner, create_day, member_count, category, affilition) VALUES (?, ?, ?, ?, ?, ?)`
        await executeQueryPromise(addClubQuery, [applicationData.club_name, applicationData.user_id, applicationData.processed_date, applicationData.member_count, availableCategory, applicationData.affilition]);
        
        const addMemberDataQuery = `SELECT * FROM member WHERE user_id = ?`;
        let memberData = await executeQueryPromise(addMemberDataQuery, [applicationData.user_id]);
        memberData = memberData[0];

        const addClubMemberQuery = `INSERT INTO club_member (category, user_id, member_name, member_student_id, member_department, member_ph_number, position, admin_ac) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        await executeQueryPromise(addClubMemberQuery, [availableCategory, memberData.user_id, memberData.user_name, memberData.user_student_id, memberData.user_department, memberData.user_ph_number, '회장', '1']);
        
    } catch (error) {
        console.error(`승인을 눌러 club, club_member 테이블에 값을 넣는중 오류 발생: ${error}`);
    }
}

function findHighestCategory(categoryList) {
    return categoryList.reduce((maxCategory, current) => Math.max(maxCategory, current.category), 0) + 1;
}

async function getLastCategory(){
    try {
        const query = `SELECT category FROM club;`;
        result = await executeQueryPromise(query);
        const availableCategory = findHighestCategory(result);
        return availableCategory;
    } catch (error) {
        console.error(`club테이블의 마지막 category 값을 가져오는중에 오류 발생: ${error}`);
    }
}

const saveEditApplication = async (req, res) => {
    const resData = {};
    try {
        const editApplicationData = req.body;
        const {club_name, member_count, affilition, user_ph_number, club_content, club_application_id} = editApplicationData.editApplicationData;

        const query = `UPDATE club_create_applications SET club_name = ?, member_count = ?, affilition = ?, user_ph_number = ?, club_content = ? WHERE club_application_id = ?`;
        await executeQueryPromise(query, [club_name, member_count, affilition, user_ph_number, club_content, club_application_id]);
        resData.success = true;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`동아리 신청서를 수정하던중 에러발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

module.exports = {
    setCreateClub,
    getCreateClubList,
    deleteClubApplication,
    getCreateClubApplicationListData,
    getCreateClubApplicationData,
    updateStatus,
    saveEditApplication,
    formatDate,
}