const { executeQuery } = require("../config/database.func");
const { getTokenDecode } = require("../controllers/tokenControllers/token.ctrl");
const { handleDBError } = require("./login.ctrl");

const getClubCategory = async (req, res, clubName) => {
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

const createPost = async (req, res) => {
    const postData = req.body;
    const resData = {};
    try {
        const decodedToken = await getTokenDecode(req, res);
        const user_id = decodedToken.id;
        const clubCategory = await getClubCategory(req, res, postData.club_name);

        if (!clubCategory) {
            res.status(500).json({ success: false, error: '클럽 카테고리를 불러오지 못했습니다.' });
            return;
        }

        executeQuery("INSERT INTO post_recruit (club_name, content, recruit_num, dead_day, writer, image_route, category) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
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
                    resData.success = "false";
                    res.json(resData);
                } else {
                    resData.success = "true";
                    res.json(resData);
                }
            })
    } catch (err) {
        console.error("게시글 작성 실패", err);
        res.status(500).json(resData);
    }
};

module.exports = {
    createPost,
    getClubCategory,
};