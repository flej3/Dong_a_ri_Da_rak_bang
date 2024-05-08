const { executeQueryPromise } = require("../../config/database.func");
const { getTokenDecode } = require("../tokenControllers/token.ctrl");
const { getUser } = require("../login.ctrl");
const { isClubOwner } = require("../index.ctrl");
const bcrypt = require("bcrypt");

const checkPw = async (req, res) => {
    const resData = {};
    try {
        const { pw } = req.body;
        const accessTokenDecoded = await getTokenDecode(req, res);

        const userDataMember = await getUser(accessTokenDecoded.id);
        if (userDataMember.length === 0) {
            resData.success = false;
            resData.msg = '사용자를 찾을 수 없습니다.';
            res.status(200).json(resData);
            return;
        }

        const isMatch = await bcrypt.compare(pw, userDataMember.user_pw);

        if (!isMatch) {
            resData.success = false;
            resData.msg = '비밀번호를 다시 확인해주세요.';
            res.status(200).json(resData);
            return;
        }

        const { isOwner } = await isClubOwner(accessTokenDecoded.id);
        if(isOwner){
            resData.success = false;
            resData.msg = '동아리 회장(대표)는 권한을 위임해야만 탈퇴가 가능합니다.';
            res.status(200).json(resData);
            return;
        }

        resData.success = true;
        res.status(200).json(resData);
    } catch (error) {
        resData.success = false;
        resData.msg = '비밀번호 확인중 에러가 발생했습니다.';
        console.error('비밀번호 확인중 에러가 발생했습니다.', error);
        res.status(500).json(resData);
    }
}

const deleteAccount = async (req, res) => {
    const resData = {};
    try {
        const { pw } = req.body;
        const accessTokenDecoded = await getTokenDecode(req, res);

        const userDataMember = await getUser(accessTokenDecoded.id);
        if (userDataMember.length === 0) {
            resData.success = false;
            resData.msg = '사용자를 찾을 수 없습니다.';
            res.status(200).json(resData);
            return;
        }

        const isMatch = await bcrypt.compare(pw, userDataMember.user_pw);

        if (!isMatch) {
            resData.success = false;
            resData.msg = '비밀번호를 다시 확인해주세요.';
            res.status(200).json(resData);
            return;
        }
        await executeQueryPromise('START TRANSACTION');

        const queryClubMember = `DELETE FROM club_member WHERE user_id = ?;`;
        await executeQueryPromise(queryClubMember, [accessTokenDecoded.id]);

        const queryComments = `UPDATE post_recruit_comments SET user_id = ?, is_deleted = ? WHERE user_id = ?`;
        await executeQueryPromise(queryComments, ["", 1, accessTokenDecoded.id]);

        const queryMember = `DELETE FROM member WHERE user_id = ?;`;
        await executeQueryPromise(queryMember, [accessTokenDecoded.id]);

        resData.success = true;
        resData.msg = '회원탈퇴에 성공 하였습니다.';
        logout(req, res);
        res.status(200).json(resData);
    } catch (error) {
        await executeQueryPromise('ROLLBACK');
        resData.success = false;
        resData.msg = '비밀번호 확인중 에러가 발생했습니다.';
        console.error('비밀번호 확인중 에러가 발생했습니다.', error);
        res.status(500).json(resData);
    }
}

function logout(req, res) {
    res.cookie('accessToken', '');
    res.cookie('refreshToken', '');
}

module.exports = {
    deleteAccount,
    checkPw,
}