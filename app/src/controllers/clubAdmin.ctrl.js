const pool = require("../config/database");
const {executeQuery} = require("../config/database.func");
const {getTokenDecode} = require("../controllers/tokenControllers/token.ctrl");
const { handleDBError } = require("./login.ctrl");

const getClubCategory = async (req, res) => {
    try {
        const decodedData = await getTokenDecode(req, res);
        return new Promise((resolve, reject) => {
            executeQuery('SELECT category FROM club WHERE club_oner = ?',
                [decodedData.id],
                (err, clubCategory) => {
                    if (err) {
                        handleDBError(err, conn);
                        reject(err);
                    } else {
                        resolve(clubCategory[0]);
                    }
                });
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// 클럽 멤버와 클럽 정보를 가져오는 함수
const getClubData = async (req, res) => {
    try {
        const clubCategory = await getClubCategory(req, res);

        // 클럽 멤버 가져오기
        executeQuery('SELECT * FROM club_member WHERE category = ?', [clubCategory.category], (err, members) => {
            if (err) {
                return res.status(500).send('Database query error'); // 에러 응답
            }

            // 클럽 정보 가져오기
            executeQuery('SELECT * FROM club WHERE category = ?', [clubCategory.category], (err, club) => {
                if (err) {
                    return res.status(500).send('Database query error'); // 에러 응답
                }

                // 클럽 멤버와 클럽 정보를 응답으로 전달
                res.render("pages-clubAdmin", { members: members, club: club[0] });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error'); // 내부 서버 오류 응답
    }
};

const getClubMember = (req, res, next) => {
    getClubData(req, res, (err, data) => {
        if (err) {
            return res.status(500).send('Database query error');
        }

        // 데이터를 렌더링할 뷰로 전달
        res.render("pages-clubAdmin", { members: data.members, club: data.club });
    });
};

module.exports = {
    getClubMember,
}