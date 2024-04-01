// const mysql = require("mysql");
const bcrypt = require("bcrypt");
const pool = require("../config/database");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

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
            return res.json({ isAvailable: false, message: "Email 또는 Password를 확인해주세요.", });
        }

        const isMatch = await bcrypt.compare(userPw, result.user_pw);
        if (!isMatch) {
            return res.json({ isAvailable: false, message: "Email 또는 Password를 확인해주세요.", });
        }

        // 로그인 성공. JWT 토큰 구현
        try {
            //access Token 발급
            const accessToken = jwt.sign(
                {
                    id: result.user_id,
                    name: result.user_name,
                    studentId: result.user_student_id,
                    department: result.user_department,
                },
                process.env.ACCESS_SECRET,
                {
                    expiresIn: "30m",
                    issuer: "Dong_A_Ri_developer",
                    algorithm: "HS512",
                }
            );

            //refresh Token 발급
            const refreshToken = jwt.sign(
                {
                    id: result.user_id,
                    name: result.user_name,
                    studentId: result.user_student_id,
                    department: result.user_department,
                },
                process.env.REFRESH_SECRET,
                {
                    expiresIn: "24h",
                    issuer: "Dong_A_Ri_developer",
                    algorithm: "HS512",
                }
            );

            //token 전송
            res.cookie("accessToken", accessToken, {
                secure: false,
                httpOnly: true,
            })

            res.cookie("refreshToken", refreshToken, {
                secure: false,
                httpOnly: true,
            })
            return res.json({ isAvailable: true, message: "로그인 성공", location: "/", });

        } catch (err) {
            return res.json({ isAvailable: false, message: "토큰 발급 실패", });
        }

    } catch (err) {
        // console.error("에러 발생:", err);
        // return res.status(500).send("서버 에러가 발생했습니다.");
        return res.json({ isAvailable: false, message: "Email 또는 Password를 확인해주세요.", });
    }
}

const accessToken = async (req, res) => {
    try {
        const token = req.cookies.accessToken;
        const data = jwt.verify(token, process.env.ACCESS_SECRET);

        const userData = await getUser(data.id);
        const { user_pw, ...newUserData } = userData;

        return res.json(newUserData);
    } catch (err) {
        return res.status(401).json(err);
    }
}

const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        const data = jwt.verify(token, process.env.REFRESH_SECRET);

        const userData = await getUser(data.id);

        //access Token 재발급
        const accessToken = jwt.sign(
            {
                id: result.user_id,
                name: result.user_name,
                studentId: result.user_student_id,
                department: result.user_department,
            },
            process.env.ACCESS_SECRET,
            {
                expiresIn: "30m",
                issuer: "Dong_A_Ri_developer",
                algorithm: "HS512",
            }
        );

        res.cookie("accessToken", accessToken, {
            secure: false,
            httpOnly: true,
        })

        res.status(200).json("access Token Recreated");
        // res.status(200);
    } catch (err) {
        res.status(500).json(err);
    }
}

const logout = (req, res) => {
    try {
        res.cookie('accessToken', '');
        res.cookie('refreshToken', '');
        // res.status(200).json("Logout Success");
        res.redirect("/");
    } catch (err) {
        res.status(500).json(err);
    }
}

const loginSuccess = (req, res) => {

}

module.exports = {
    checkUserAvailability,
    accessToken,
    refreshToken,
    logout,
    loginSuccess,
    getUser,
    handleDBError,
};
