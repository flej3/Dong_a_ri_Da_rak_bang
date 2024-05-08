const { executeQuery, executeQueryPromise} = require("../../config/database.func");
const { handleDBError } = require("../login.ctrl");
const {getTokenDecode} = require("../../controllers/tokenControllers/token.ctrl");

const getRecruitPostList = (req, res) => {
    try {
        // const postingNum = req.query.postingNum;
        const RecruitPostsData = {};
        executeQuery(
            "SELECT * FROM post_recruit;",
            (err, result) => {
                if (err) {
                    handleDBError(`글을 불러오는 중 에러 발생: ${err}`);
                    return;
                }
                if (result.length === 0) {
                    RecruitPostsData.success = false;
                    return res.json(RecruitPostsData);
                }
                RecruitPostsData.success = true;
                RecruitPostsData.postData = result;
                //postingData.postData에 이미 content라는 키값이 있는데 안에 내용을 변경.
                //문자열로 되어있어서 json객체로 변경해서 덮어씌움
                for (let idx = 0; idx < result.length; idx++) {
                    RecruitPostsData.postData[idx].content = JSON.parse(result[idx].content);
                }
                res.json(RecruitPostsData);
            })
    } catch (error) {
        console.error("게시글 불러오기 실패", error);
    }
}

const getLikes = async (req, res) => {
    let success = true;
    try {
        let result = await executeQueryPromise(
            "SELECT post_number, COUNT(*) AS post_likes FROM user_likes GROUP BY post_number;"
        );
        for(let i = 0 ; i < result.length; i++) {
            let updateResult = await executeQueryPromise(
                "UPDATE post_recruit SET like_count = ? where post_number = ?;",[result[i].post_likes, result[i].post_number]
            );
            if (!updateResult || updateResult.affectedRows === 0) {
                success = false;
                break;
            }
        }
    } catch (error) {
        console.error(error);
        success = false;
    }
    res.json(success);
}

const getLikeSplit = async (req, res) => {
    try {
        const decodedData = await getTokenDecode(req, res);
        return new Promise((resolve, reject) => {
            executeQuery('SELECT * FROM user_likes WHERE user_id = ?;',
                [decodedData.id],
                (err, like) => {
                    if (err) {
                        handleDBError(err, conn);
                        reject(err);
                    } else {
                        res.json({ like:like });
                    }
                });
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = {
    getRecruitPostList,
    getLikes,
    getLikeSplit,
}