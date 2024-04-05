const { executeQuery } = require("../../../config/database.func");
const { handleDBError } = require("../../login.ctrl");

const getViewRecruitPostFromNum = async (req, res) => {
    const postNum = req.query.query;
    const postingData = {};
    try {
        executeQuery(
            "SELECT * FROM post_recruit WHERE post_number = ?;",
            [postNum],
            (err, result) => {
                if (err) {
                    handleDBError(`글을 불러오는 중 에러 발생: ${err}`);
                    return;
                }
                if (!result || result.length === 0) {
                    postingData.success = false;
                    return res.json(postingData);
                }
                postingData.success = true;
                postingData.postData = result[0];

                //postingData.postData에 이미 content라는 키값이 있는데 안에 내용을 변경.
                //문자열로 되어있어서 json객체로 변경해서 덮어씌움
                postingData.postData.content = JSON.parse(result[0].content);
                res.json(postingData);
            })
    } catch (error) {
        console.error("게시글 불러오기 실패", error);
    }
}

module.exports = {
    getViewRecruitPostFromNum,
};