const pool = require("../config/database");
const {executeQuery, executeQueryPromise} = require("../config/database.func");
const {getTokenDecode} = require("../controllers/tokenControllers/token.ctrl");
const { handleDBError } = require("./login.ctrl");
const {entry} = require("quill-image-resize-module/webpack.config");

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

const newMember = async (req, res) => {
    const newData = req.body;
    const resData = {};
    try {
        const clubCategory = await getClubCategory(req, res);
        let successCount = 0; // 성공한 쿼리의 개수를 추적하기 위한 변수
        for (let i = 0; i < newData.length; i++) {
            await executeQueryPromise("INSERT INTO club_member (category, member_name, member_student_id, member_department, member_ph_number, position, admin_ac) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    clubCategory.category,
                    newData[i].member_name,
                    newData[i].member_student_id,
                    newData[i].member_department,
                    newData[i].member_ph_number,
                    newData[i].position,
                    newData[i].admin_ac
                ]);

            successCount++; // 성공한 쿼리의 개수 증가
        }

        // 모든 쿼리가 완료된 후에 한 번만 응답을 보냄
        if (successCount === newData.length) {
            resData.success = true;
            res.json(resData);
        }
    } catch (err) {
        console.error("회원 추가 실패", err);
        res.status(500).json(resData);
    }
};

const updateMember = async (req, res) => {
    const updateData = req.body;
    const resData = {};
    const category = req.query.query;
    try {
        let successCount = 0; // 성공한 쿼리의 개수를 추적하기 위한 변수
        for (let i = 0; i < updateData.length; i++) {
            let query, params;
            if (typeof updateData[i].value === 'boolean') {
                query = "UPDATE club_member SET admin_ac = ? WHERE member_student_id = ? AND category = ?";
            } else {
                query = "UPDATE club_member SET position = ? WHERE member_student_id = ? AND category = ?";
            }
            params = [updateData[i].value, updateData[i].key, category];

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
    const category = req.query.query;
    const resData = {};
    try {
            executeQuery("DELETE fROM club_member WHERE member_student_id = ? AND category = ?",
                [
                    newData.id,
                    category
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

const getClubMember = async (req, res, next) => {
    try {
        const category = req.query.query;
        const clubData = await getClubDataNew(req,res,category);

        res.render("pages-clubAdmin", clubData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error'); // 내부 서버 오류 응답
    }
};

async function getClubDataNew(req,res,category) {
    try {
        const clubData = { members: null, club: null, recruits: null, checkAdmin: null};
        const memberPromise = new Promise((resolve, reject) => {
            executeQuery('SELECT * FROM club_member WHERE category = ?',
                [category],
                (err, result) => {
                    if (err) {
                        reject(new Error('club_member 테이블 조회중 에러 발생')); // 에러 응답
                    } else {
                        clubData.members = result;
                        resolve();
                    }
                });
        });

        const clubPromise = new Promise((resolve, reject) => {
            executeQuery('SELECT * FROM club WHERE category = ?',
                [category],
                (err, result) => {
                    if (err) {
                        reject(new Error('club 테이블 조회중 에러 발생')); // 에러 응답
                    } else {
                        clubData.club = result[0];
                        resolve();
                    }
                });
        });

        const recruitPromise = new Promise((resolve, reject) => {
            executeQuery('SELECT * FROM post_recruit WHERE category = ?',
                [category],
                (err, result) => {
                    if (err) {
                        reject(new Error('post_recruit 테이블 조회중 에러 발생')); // 에러 응답
                    } else {
                        clubData.recruits = result;
                        resolve();
                    }
                });
        });

        const userId = new Promise(async (resolve, reject) => {
            try {
                const decodedData = await getTokenDecode(req, res);
                // getTokenDecode 함수가 성공적으로 실행되면, 디코딩된 데이터를 사용하여 쿼리 실행
                executeQuery('SELECT * FROM club_member WHERE user_id = ? AND category = ?',
                    [decodedData.id, category],
                    (err, result) => {
                        if (err) {
                            reject(new Error('권한 조회 중 에러 발생'));
                        } else {
                            clubData.checkAdmin = result;
                            resolve();
                        }
                    });
            } catch (error) {
                reject(error);
            }
        });

        await Promise.all([memberPromise, clubPromise, recruitPromise, userId]);
        return clubData;
    } catch (error) {
        throw error;
    }
}

const getClubs = async (req, res) => {
    try {
        const decodedData = await getTokenDecode(req, res);
        return new Promise((resolve, reject) => {
            executeQuery('SELECT * FROM clubdb.club INNER JOIN clubdb.club_member ON club.category = club_member.category WHERE club_member.user_id = ?',
            [decodedData.id],
                (err, clubs) => {
                    if (err) {
                        handleDBError(err, conn);
                        reject(err);
                    } else {
                        res.json({ clubs: clubs });
                    }
                });
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const isClubMember = async (req, res, next) => {
    try {
        const category = req.query.query;
        const decodedData = await getTokenDecode(req, res);
        const userId = decodedData.id;

        const result = await new Promise((resolve, reject) => {
            executeQuery('SELECT * FROM club_member WHERE user_id = ? AND category = ?;', [userId, category], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        if (result.length === 0) {
            res.redirect("/error-page");
        } else {
            next();
        }
    } catch (error) {
        handleDBError(error, conn);
    }
};

const checkMember = async (req, res) => {
    try {
        const category = req.query.query;
        const decodedData = await getTokenDecode(req, res);
        const userId = decodedData.id;

        const result = await executeQueryPromise('SELECT admin_ac FROM club_member WHERE user_id = ? AND category = ?;', [userId, category]);

        if (result.length === 0) {
            return res.json({ error: "No results found" });
        } else {
            return res.json({ success: true, result: result });
        }
    } catch (error) {
        handleDBError(error, conn);
        return res.status(500).json({ error: "Database error" });
    }
};



module.exports = {
    getClubMember,
    newMember,
    deleteMember,
    updateMember,
    getClubs,
    isClubMember,
    checkMember,
}