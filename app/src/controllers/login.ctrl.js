// const mysql = require("mysql");
const bcrypt = require("bcrypt");
const pool = require("../config/database");

// 공통 에러 처리 함수
function handleDBError(err, conn) {
    if (conn) conn.release();
    console.error(`DB Error: ${err.message}`);
}

function getUser(userid) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err) {
                handleDBError(err, conn);
                return reject(err);
            }

            conn.query("SELECT * FROM member WHERE user_id = ?", [userid], (err, result) => {
                conn.release();
                if (err) {
                    handleDBError(err, conn);
                    return reject(err);
                }
                return resolve(result[0]);
            });
        });
    });
}
const checkUserAvailability = async (req, res, next) => {
    try {
        const { userId, userPw, } = req.body;
        const result = await getUser(userId);

        if (result.length === 0) {
            return res.json({ isAvailable: false, message: "Email 또는 Password를 확인해주세요.",});
        }

        const isMatch = await bcrypt.compare(userPw, result.user_pw);
        if (!isMatch) {
            return res.json({ isAvailable: false, message: "Email 또는 Password를 확인해주세요.", });
        }
        return res.json({ isAvailable: true, message: "로그인 성공", location: "/",});

        // // 로그인 성공.
        // try {//JWT 토큰 구현

        // } catch (err) {

        // }

    } catch (err) {
        // console.error("에러 발생:", err);
        // return res.status(500).send("서버 에러가 발생했습니다.");
        res.json({ isAvailable: false, message: "Email 또는 Password를 확인해주세요.", });
    }
}

module.exports = {
    checkUserAvailability,
};
