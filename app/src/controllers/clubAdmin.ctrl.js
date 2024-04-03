const pool = require("../config/database");
const {executeQuery} = require("../config/database.func");
const {getTokenDecode} = require("../controllers/tokenControllers/token.ctrl");
const { handleDBError } = require("./login.ctrl");

const getClubCategory = async (req, res) => {
    try {
        const decodedData = await getTokenDecode(req, res);
        return new Promise((resolve, reject) => {
            executeQuery('SELECT category FROM club_member WHERE user_id = ?',
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

               // 모집 공고 가져오기
                executeQuery('SELECT * FROM post_recruit WHERE category = ?', [clubCategory.category], (err, recruits) => {
                    if (err) {
                        return res.status(500).send('Database query error'); // 에러 응답
                    }

                    // 클럽 멤버, 클럽 정보, 모집 공고를 응답으로 전달
                    res.render("pages-clubAdmin", { members: members, club: club[0], recruits: recruits });
                });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error'); // 내부 서버 오류 응답
    }
};

const newMember = async (req, res) => {
    const newData = req.body;
    const resData = {};
    try {
        const clubCategory = await getClubCategory(req, res);
        let successCount = 0; // 성공한 쿼리의 개수를 추적하기 위한 변수
        for (let i = 0; i < newData.length; i++) {
            executeQuery("INSERT INTO club_member (category, member_name, member_student_id, member_department, member_ph_number, position, admin_ac) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    clubCategory.category,
                    newData[i].member_name,
                    newData[i].member_student_id,
                    newData[i].member_department,
                    newData[i].member_ph_number,
                    newData[i].position,
                    newData[i].admin_ac
                ],
                (err, result) => {
                    if (err) {
                        handleDBError(`db insert failed: ${err}`);
                    } else {
                        successCount++; // 성공한 쿼리의 개수 증가
                    }
                    // 모든 쿼리가 완료된 후에 한 번만 응답을 보냄
                    if (successCount === newData.length) {
                        resData.success = true;
                        res.json(resData);
                    }
                }
            );
        }
    } catch (err) {
        console.error("회원 추가 실패", err);
        res.status(500).json(resData);
    }
};


const updateMember = async (req, res) => {
    const updateData = req.body;
    const resData = {};
    try {
        let successCount = 0; // 성공한 쿼리의 개수를 추적하기 위한 변수
        for (let i = 0; i < updateData.length; i++) {
            let query, params;
            if (typeof updateData[i].value === 'boolean') {
                query = "UPDATE club_member SET admin_ac = ? WHERE member_student_id = ?";
            } else {
                query = "UPDATE club_member SET position = ? WHERE member_student_id = ?";
            }
            params = [updateData[i].value, updateData[i].key];

            await new Promise((resolve, reject) => {
                executeQuery(query, params, (err, result) => {
                    if (err) {
                        handleDBError(`db update failed: ${err}`);
                        reject(err);
                    } else {
                        successCount++; // 성공한 쿼리의 개수 증가
                        resolve();
                    }
                });
            });
        }
        // 모든 쿼리가 완료된 후에 한 번만 응답을 보냄
        resData.success = true;
        res.json(resData);
    } catch (err) {
        console.error("회원 변경 실패", err);
        res.status(500).json(resData);
    }
};

const deleteMember = async (req, res) => {
    const newData = req.body;
    const resData = {};
    try {
            executeQuery("DELETE fROM club_member WHERE member_student_id = ?",
                [
                    newData.id
                ],
                (err, result) => {
                    if (err) {
                        handleDBError(`db insert failed: ${err}`);
                    } else {
                        console.log("회원 삭제 성공");
                        resData.success = true;
                        res.json(resData);
                    }
                }
            );
    } catch (err) {
        console.error("회원 삭제 실패", err);
        res.status(500).json(resData);
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
    newMember,
    deleteMember,
    updateMember,
}