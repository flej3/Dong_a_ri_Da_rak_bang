const jwt = require("jsonwebtoken");
const { getUser } = require("./login.ctrl");
const dotenv = require("dotenv");
dotenv.config();

async function refreshTokenMiddleware(req, res, next) {

    const refreshToken = req.cookies.refreshToken;
    
    // refreshToken이 존재하지 않는 경우 다음 미들웨어로 이동
    if (!refreshToken) {
        return next();
    }

    try {
        // refreshToken의 유효성 검사
        const refreshData = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

        // refreshToken이 유효한 경우, 사용자 정보를 기반으로 새로운 accessToken 생성
        const userData = await getUser(refreshData.id);
        const newAccessToken = jwt.sign(
            {
                id: userData.user_id,
                name: userData.user_name,
                studentId: userData.user_student_id,
                phoneNumber: userData.user_ph_number,
            },
            process.env.ACCESS_SECRET,
            {
                expiresIn: "1m", // 예시로 1분 설정, 필요에 따라 조절
                issuer: "Dong_A_Ri_developer",
                algorithm: "HS512",
            }
        );

        // 새로운 accessToken을 쿠키에 설정하고 클라이언트에게 반환
        res.cookie("accessToken", newAccessToken, {
            secure: false, // HTTPS를 사용할 경우 true로 설정
            httpOnly: true,
        });

        req.user = {
            id: userData.user_id,
            name: userData.user_name,
            studentId: userData.user_student_id,
            phoneNumber: userData.user_ph_number,
        };
        next();

    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            // refreshToken이 만료된 경우
            console.error("refreshToken expired");
            return res.status(401).json({ message: "Session expired, please log in again" });
        } else {
            // refreshToken 검증 중 다른 오류 발생
            console.error("Error verifying refreshToken:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

module.exports = {
    refreshTokenMiddleware,
};