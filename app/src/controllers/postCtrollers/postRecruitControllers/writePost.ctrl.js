const { executeQuery } = require("../../../config/database.func");
const { handleDBError } = require("../../../controllers/login.ctrl");
const { getTokenDecode } = require("../../tokenControllers/token.ctrl");
const { isClubOwner } = require("../../index.ctrl");

const getClubCategory = async (clubName) => {
    return new Promise((resolve, reject) => {
        executeQuery('SELECT category FROM club WHERE club_name = ?',
            [clubName],
            (err, clubCategory) => {
                if (err) {
                    handleDBError(err);
                    reject(err);
                } else {
                    if (clubCategory.length > 0) {
                        resolve(clubCategory[0].category);
                    } else {
                        resolve(null); // 클럽이 존재하지 않을 때 처리
                    }
                }
            });
    });
};

//동아리 홍보 게시글을 작성할때 현재 작성자가 해당 동아리 이름에 적은 동아리의
//Owner가 맞는지 확인
function verifyClubAdmin(user_id, club_name) {
    return new Promise((resolve, reject) => {
        executeQuery('SELECT * FROM club WHERE club_owner = ? AND club_name = ?',
            [user_id, club_name],
            (err, result) => {
                if (err) {
                    handleDBError(err);
                    reject(err);
                } else {
                    if (result.length > 0) {
                        resolve(true); // 해당 동아리 이름에 대한 관리자가 맞음
                    } else {
                        resolve(false); // 해당 동아리 이름에 대한 관리자가 아님
                    }
                }
            });
    });
}

const createPost = async (req, res) => {
    const postData = req.body;
    const resData = {};
    try {
        const decodedToken = await getTokenDecode(req, res);
        const user_id = decodedToken.id;
        const isClubOwner = await verifyClubAdmin(user_id, postData.club_name)
        if (!isClubOwner) {
            resData.isClubOwner = false;
            return res.json(resData);
        }
        resData.isClubOwner = true;
        const clubCategory = await getClubCategory(postData.club_name);

        executeQuery("INSERT INTO post_recruit (title, club_name, content, recruit_num, dead_day, writer, image_route, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                postData.title,
                postData.club_name,
                postData.content,
                postData.recruit_num,
                postData.dead_day,
                user_id,
                postData.image_route,
                clubCategory
            ],
            (err, result) => {
                if (err) {
                    handleDBError(`포스팅 게시글 DB에 넣을때 에러 발생: ${err}`);
                    resData.success = false;
                    return res.json(resData);
                }
                resData.success = true;
                res.json(resData);
            })
    } catch (err) {
        console.error("게시글 작성 실패", err);
        resData.success = false;
        res.status(500).json(resData);
    }
};

//페이지에 접속했을때 접속한 대상자가 클럽 오너 자격이 있는지 확인.
const checkClubOwner = async (req, res) => {
    try {
        const decodedToken = await getTokenDecode(req, res);
        const user_id = decodedToken.id;

        const clubOwnerStatus = await isClubOwner(user_id);
        if (!clubOwnerStatus.isOwner) {
            return res.json({ isOwner: false, msg: "동아리 대표만 작성할 수 있습니다." });
        }
        res.json({ isOwner: true });
    } catch (error) {
        console.error("클럽 소유자 확인 중 오류:", error);
        res.status(500).json({ error: "서버 오류 발생" });
    }
}

module.exports = {
    createPost,
    getClubCategory,
    checkClubOwner,
};