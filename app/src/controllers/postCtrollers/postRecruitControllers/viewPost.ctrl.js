const { executeQuery, executeQueryPromise } = require("../../../config/database.func");
const { handleDBError } = require("../../login.ctrl");
const {getTokenDecode, check} = require("../../tokenControllers/token.ctrl");

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

const addLike = async (req, res) => {
    const postNum = req.query.query;
    const decodedData = await getTokenDecode(req, res);
    try {
        await executeQueryPromise(
            "INSERT INTO user_likes (user_id, post_number) values (?,?);",
            [decodedData.id, postNum]
        );
        await executeQueryPromise(
            "UPDATE post_recruit SET like_count = like_count +1 WHERE post_number = ?;",
            [postNum]
        );
        res.status(200).send('좋아요 추가 성공');
    } catch (error) {
        console.error("좋아요 실패", error);
        res.status(500).send('좋아요 추가 실패');
    }
}

const minusLike = async (req, res) => {
    const postNum = req.query.query;
    const decodedData = await getTokenDecode(req, res);
    try {
        await executeQueryPromise(
            "DELETE FROM user_likes WHERE user_id = ? AND post_number =?;",
            [decodedData.id, postNum]
        );
        await executeQueryPromise(
            "UPDATE post_recruit SET like_count = like_count -1 WHERE post_number = ?;",
            [postNum]
        );
        res.status(200).send('좋아요 취소 성공');
    } catch (error) {
        console.error("좋아요 취소 실패", error);
        res.status(500).send('좋아요 취소 실패');
    }
}

const likeSplit = async (req, res) => { //각 사용자마다 하트 활성화 함수
    let heartSplit = {};
    const postNum = req.query.query;
    const decodedData = await getTokenDecode(req, res);
        try {
            let result = await executeQueryPromise(
                "SELECT * FROM user_likes WHERE user_id = ? AND post_number = ?;",
                [decodedData.id, postNum]
            );
            if (result.length > 0) {
                heartSplit = true;
                res.json(heartSplit);
            } else {
                heartSplit = false;
                res.json(heartSplit);
            }
        } catch (error) {
            console.error(error);
        }

}


module.exports = {
    getViewRecruitPostFromNum,
    minusLike,
    addLike,
    likeSplit,
};