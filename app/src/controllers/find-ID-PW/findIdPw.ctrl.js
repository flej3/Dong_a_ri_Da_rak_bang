const { executeQueryPromise } = require("../../config/database.func");
const bcrypt = require("bcrypt");

const findID = async (req, res) => {
    const resData = {};
    try {
        const { user_name, user_student_id, user_department, user_ph_number } = req.body;
        const query = `SELECT user_id FROM member WHERE user_name = ? AND user_student_id = ? AND user_department = ? AND user_ph_number = ?;`;
        const user_id = await executeQueryPromise(query, [user_name, user_student_id, user_department, user_ph_number]);

        if(user_id.length === 0){
            resData.success = true;
            resData.user_id = false;
            res.status(200).json(resData);
            return;
        }
        
        resData.success = true;
        resData.user_id = user_id[0];
        res.status(200).json(resData);
    } catch (error) {
        console.error(`유저 ID 조회중 에러발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const checkPwCode = async (req, res)=> {
    const resData = {};
    try {
        const { pwCode } = req.body;
        const query = `SELECT user_id FROM member WHERE user_pw = ?;`;
        const user_id = await executeQueryPromise(query, [pwCode]);
        if(user_id.length === 0){
            resData.success = false;
            resData.user_id = false;
            res.status(200).json(resData);
            return;
        }
        resData.success = true;
        resData.user_id = user_id[0].user_id;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`유저 pw 코드 조회중 에러발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

const changePw = async (req, res) => {
    const resData = {};
    try {
        const {id, pw} = req.body;
        const hashedNewPassword = await bcrypt.hash(pw, 10);
        const query = `UPDATE member SET user_pw = ? WHERE user_id = ?;`;
        await executeQueryPromise(query, [hashedNewPassword, id]);
        resData.success = true;
        res.status(200).json(resData);
    } catch (error) {
        console.error(`유저 비밀번호 변경중 에러발생: ${error}`);
        resData.success = false;
        res.status(500).json(resData);
    }
}

module.exports = {
    findID,
    checkPwCode,
    changePw,
}