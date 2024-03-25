const { executeQuery } = require("../../config/database.func");
const { getTokenDecode } = require("../tokenControllers/token.ctrl");
const { handleDBError, getUser } = require("../login.ctrl");
const bcrypt = require("bcrypt");

const setChangePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, } = req.body;
        const accessTokenDecoded = await getTokenDecode(req, res);

        const userDataMember = await getUser(accessTokenDecoded.id);

        if (userDataMember.length === 0) {
            return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
        }

        const isMatch = await bcrypt.compare(currentPassword, userDataMember.user_pw);

        if (!isMatch) {
            return res.json({ success: false, message: "현재 비밀번호를 다시 확인해주세요.", });
        } else {
            // 새로운 비밀번호를 해싱하여 업데이트
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            // member 테이블의 user_pw 컬럼 업데이트 쿼리 실행
            const query = `UPDATE member SET user_pw = ? WHERE user_id = ?`;
            executeQuery(query, [hashedNewPassword, accessTokenDecoded.id], (err, result) => {
                if (err) {
                    console.error('Error updating password in the database:', err);
                    return res.status(500).json({ success: false, message: "비밀번호 업데이트 중 오류가 발생했습니다." });
                }

                if (result.affectedRows > 0) {
                    return res.json({ success: true, message: "비밀번호가 성공적으로 변경되었습니다." });
                } else {
                    return res.json({ success: false, message: "비밀번호 변경에 실패했습니다." });
                }
            });
        }

    } catch (error) {
        console.error('비밀번호 변경 중 오류가 발생했습니다.', error);
        return res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
    }
}

module.exports = {
    setChangePassword
}