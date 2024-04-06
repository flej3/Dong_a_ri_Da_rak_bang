// const mysql = require("mysql");
const bcrypt = require("bcrypt");
const pool = require("../config/database");
const { executeQuery } = require("../config/database.func");

const saltRounds = 10; // 솔트 라운드 수

// 공통 에러 처리 함수
function handleDBError(err, conn) {
    if (conn) conn.release();
    console.error(`DB Error: ${err.message}`);
}

// 사용자 ID 확인 함수
const userIdCheck = (req, res, next) => {
    const userId = req.body.userId;
    pool.getConnection((err, conn) => {
        if (err) return handleDBError(err);

        conn.query(
            "SELECT COUNT(*) AS count FROM member WHERE user_id = ?",
            [userId],
            (err, result) => {
                conn.release();
                if (err) return handleDBError(err, conn);
                
                console.log(`해당 userId가 ${result[0].count > 0 ? "존재합니다." : "존재하지 않습니다."}`);
                req.isAvailable = result[0].count > 0;
                next();
            }
        );
    });
};

// 사용자 학번 확인 함수
const userStudentIdCheck = (req, res, next) => {
    const resData = {};
    const studentId = req.body.userStudentId;
    executeQuery('SELECT COUNT(*) AS count FROM member WHERE user_student_id = ?;',
        [studentId],
        (err, result) => {
            if (err) {
                handleDBError(`포스팅 게시글 DB를 업데이트할 때 에러 발생: ${err}`);
                resData.success = false;
                return res.json(resData);
            }
            if(result[0].count > 0){
                resData.isAvailable = true;
                resData.message = "이미 존재하는 학번입니다.";
                return res.json(resData);
            }
            resData.isAvailable = false;
            resData.message = "사용 가능한 학번입니다.";
            res.json(resData);
            next();
        })
}

// 비밀번호 해싱 함수
function hashPassword(password) {
    return bcrypt.hash(password, saltRounds);
}

// 사용자 생성 함수
const createUser = async (req, res) => {
    const userData = req.body;
    try {
        userData.user_pw = await hashPassword(userData.user_pw);
        pool.getConnection(async (err, conn) => {
            if (err) return handleDBError(err);

            conn.query(
                "INSERT INTO member (user_id, user_pw, user_name, user_student_id, user_department, user_ph_number) VALUES (?,?,?,?,?,?)",
                [
                    userData.user_id,
                    userData.user_pw,
                    userData.user_name,
                    userData.user_student_id,
                    userData.user_department,
                    userData.user_ph_number,
                ],
                (err, result) => {
                    conn.release();
                    if (err) {
                        console.error("계정 생성 실패");
                        return res.json({ success: false, message: "계정 생성에 실패했습니다.", locate: "pages-register"});
                    }
                    res.json({ success: true, message: "계정 생성에 성공했습니다.", locate: "pages-login" });
                }
            );
        });
    } catch (error) {
        console.error("비밀번호 해시 실패", error);
        res.json({ success: false, message: "비밀번호 해싱 과정에서 오류가 발생했습니다." });
    }
};

module.exports = {
    userIdCheck,
    userStudentIdCheck,
    createUser,
};
