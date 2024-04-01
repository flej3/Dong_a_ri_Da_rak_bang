const { executeQuery } = require("../../config/database.func");
const { handleDBError } = require("../login.ctrl");

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
                if(result.length === 0 ){
                    RecruitPostsData.success = false;
                    return res.json(RecruitPostsData);
                }
                RecruitPostsData.success = true;
                RecruitPostsData.postData = result;
                //postingData.postData에 이미 content라는 키값이 있는데 안에 내용을 변경.
                //문자열로 되어있어서 json객체로 변경해서 덮어씌움
                for(let idx = 0; idx<result.length; idx++){
                    RecruitPostsData.postData[idx].content = JSON.parse(result[idx].content);
                }
                res.json(RecruitPostsData);
            })
    } catch (error) {
        console.error("게시글 불러오기 실패", error);
    }
}

module.exports = {
    getRecruitPostList,
}