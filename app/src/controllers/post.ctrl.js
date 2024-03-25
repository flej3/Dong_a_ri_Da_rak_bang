const { executeQuery } = require("../config/database.func");
const { handleDBError } = require("./login.ctrl");
const { getTokenDecode } = require("../controllers/tokenControllers/token.ctrl");

// const getPost = (postId, callback) => {
//     executeQuery("SELECT * FROM post_recruit WHERE id = ?", [postId], (err, result) => {
//         if (err) {
//             handleDBError(`글을 불러오는 중 에러 발생: ${err}`);
//             callback(err, null);
//         } else {
//             if (result.length > 0) {
//                 // 결과가 존재하면 첫 번째 결과를 콜백으로 전달
//                 callback(null, result[0]);
//             } else {
//                 // 결과가 없을 때 에러 처리
//                 const error = new Error("해당 ID의 게시물을 찾을 수 없습니다.");
//                 callback(error, null);
//             }
//         }
//     });
// };
const getPost = async (req, res) => {
    try {
        const postingData = {};
        const accessToken = await getTokenDecode(req, res);
        const writer = accessToken.id;
        executeQuery(
            "SELECT * FROM post_recruit WHERE writer = ? ORDER BY post_number DESC LIMIT 1;",
            [writer],
            (err, result) => {
                if (err) {
                    handleDBError(`글을 불러오는 중 에러 발생: ${err}`);
                    return;
                }
                if (result.length === 0) {
                    postingData.success = false;
                    return res.postingData;
                }
                postingData.success = true;
                postingData.postData = result[0];
                res.json(postingData);
            })
    } catch (error) {
        console.error("게시글 불러오기 실패", error);
    }
}


module.exports = {
    getPost,
};