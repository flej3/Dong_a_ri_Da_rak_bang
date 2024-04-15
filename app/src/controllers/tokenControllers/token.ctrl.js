const jwt = require("jsonwebtoken");
const { getUser } = require("../login.ctrl");
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
                department: userData.user_department,
            },
            process.env.ACCESS_SECRET,
            {
                expiresIn: "30m", // 예시로 30분 설정, 필요에 따라 조절
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
            department: userData.user_department,
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

//발급되어있는 AccessToken을 가져와서 디코딩한 결과.
const getTokenDecode = async (req, res) => {
    try {
        const token = req.cookies.accessToken;
        const data = jwt.verify(token, process.env.ACCESS_SECRET);

        return data;
    } catch (error) {
        return res.status(401).json(error);
    }
}

//로그인 검증
const verifyToken = (req, res, next) => {
    // 클라이언트로부터 JWT를 받음
    const token = req.cookies.accessToken;
    // JWT가 없는 경우
    if (!token) {
        // return res.status(401).json({ message: '인증 토큰이 없습니다.' });
        return res.redirect('/pages-login');
    }
    try {
        // JWT를 검증하여 페이로드(사용자 정보)를 추출
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        req.user = decoded; // 추출한 사용자 정보를 요청 객체에 저장
        next(); // 다음 미들웨어로 이동
    } catch (err) {
        // return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
        return res.redirect('/pages-login');
    }
};

//로그인 검증, 클라이언트 측에서 지금 로그인된건지 확인하는 미들웨어.
const isLogin = (req, res, next) => {
    const token = req.cookies.accessToken;
    // JWT가 없는 경우
    if (!token) {
        return res.json({ isLogin: false });
    }
    try {
        // JWT를 검증하여 페이로드(사용자 정보)를 추출
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        req.user = decoded; // 추출한 사용자 정보를 요청 객체에 저장
        res.json({ isLogin: true, decoded });
        next(); // 다음 미들웨어로 이동
    } catch (err) {
        res.json({ isLogin: false });
    }
};

module.exports = {
    refreshTokenMiddleware,
    getTokenDecode,
    verifyToken,
    isLogin,
};