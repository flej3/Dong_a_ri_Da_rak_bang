const { executeQuery } = require("../../../../config/database.func");
const { handleDBError } = require("../../../../controllers/login.ctrl");
const { getTokenDecode } = require("../../../tokenControllers/token.ctrl");
const { getCategoryQuery } = require("../../../comments/recruit_comments/recruit_comment.ctrl");

const isJoinedThisClub = async (req, res) => {
    const resData = {};
    try {
        const postNum = req.query.query;
        const decodedToken = await getTokenDecode(req, res);

        const query = `SELECT * FROM club_member
                        WHERE category = (
                            SELECT category FROM post_recruit
                            WHERE post_number = ?
                        ) AND member_student_id = ?;
                        `;

        executeQuery(query, [postNum, decodedToken.studentId],
            (err, result) => {
                if (err) {
                    handleDBError(`해당 동아리에 가입여부를 확인중 에러 발생: ${err}`);
                    resData.success = false;
                    resData.canJoinUser = false;
                    return res.json(resData);
                }
                if (result.length !== 0) {
                    resData.success = true;
                    resData.canJoinUser = false;
                    return res.json(resData);
                }
                resData.success = true;
                resData.canJoinUser = true;
                return res.json(resData);
            })
    } catch (error) {
        console.error(`해당 동아리에 가입여부를 확인중 에러 발생: ${error}`);
        resData.success = false;
        resData.canJoinUser = false;
        res.status(500).json(resData);
    }
}

const getMemberData = async (req, res) => {
    const resData = {};
    try {
        const decodedToken = await getTokenDecode(req, res);
        
        executeQuery('SELECT user_id, user_name, user_student_id, user_department, user_ph_number FROM member WHERE user_id = ?',
        [decodedToken.id],
        (err, result) => {
            if(err){
                handleDBError(`유저 정보를 가져오는중 에러 발생: ${err}`);
                resData.success = false;
                return res.json(resData);
            }
            resData.success = true;
            resData.userData = result[0];
            res.json(resData);
        }
    )
    } catch (error) {
        console.error(`유저 정보를 가져오는중 에러 발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const setClubApplication = async (req, res) => {
    const resData = {};
    try {
        const clubApplicationData = req.body;
        const category = await getCategoryQuery(clubApplicationData.postNum);

        const query = `INSERT INTO club_applications (user_id, category, gender, residence, introduction) VALUES (?, ?, ?, ?, ?)`;
        executeQuery(query, [clubApplicationData.user_id, category.category, clubApplicationData.gender, clubApplicationData.residence, clubApplicationData.introduction],
        (err, result) => {
            if(err){
                handleDBError(`클럽 신청서를 DB에 넣다가 에러 발생: ${err}`);
                resData.success = false;
                return res.json(resData);
            }
            resData.success = true;
            return res.json(resData);
        })
    } catch (error) {
        console.error("클럽 신청서 작성 실패", error);
        resData.success = false;
        res.status(500).json(resData);
    }
}

module.exports = {
    isJoinedThisClub,
    getMemberData,
    setClubApplication,
}