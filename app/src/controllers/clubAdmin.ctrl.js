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
    const category = req.query.query;
    try {
        let successCount = 0; // 성공한 쿼리의 개수를 추적하기 위한 변수
        for (let i = 0; i < newData.length; i++) {
            await executeQueryPromise("INSERT INTO club_member (category, member_name, member_student_id, member_department, member_ph_number, position, admin_ac) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    category,
                    newData[i].member_name,
                    newData[i].member_student_id,
                    newData[i].member_department,
                    newData[i].member_ph_number,
                    newData[i].position,
                    newData[i].admin_ac,
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

async function hasClubAdminAc(category, userId) {
    try {
        const query = `SELECT * FROM club_member WHERE user_id = ? AND category = ? AND admin_ac = ?;`;
        const result = await executeQueryPromise(query, [userId, category, '1']);

        if(result.length === 0){
            return false;
        }
        return true;
    } catch (error) {
        console.error(`동아리 권한자 확인중 에러 발생 ${error}`);
        return false;
    }
}

const getClubMember = async (req, res, next) => {
    try {
        const category = req.query.query;
        const tokenDecoded = await getTokenDecode(req, res);
        const userId = tokenDecoded.id;
        const clubData = await getClubDataNew(req,res,category);
        const hasAdminAc = await hasClubAdminAc(category, userId);
        clubData.hasAdminAc = hasAdminAc;
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
            executeQuery('SELECT * FROM clubdb.club INNER JOIN clubdb.club_member ON club.category = club_member.category INNER JOIN clubdb.member ON club_owner = member.user_id WHERE club_member.user_id = ?',
            [decodedData.id],
                (err, clubs) => {
                    if (err) {
                        handleDBError(err, conn);
                        reject(err);
                    } else {
                        res.json({ clubs: clubs, id:decodedData });
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

const changeOwner = async (req, res) => {
    const newData = req.body;
    const resData = {};
    const results = await executeQueryPromise("SELECT * FROM member WHERE user_student_id = ?", [newData.stId]);
    const previousData = await executeQueryPromise("SELECT * FROM clubdb.club_member AS cm JOIN clubdb.club AS c ON cm.user_id = c.club_owner WHERE c.category = ? AND cm.category = ?",
        [newData.category, newData.category]);

    if (results.length > 0) {
        let successCount = 0;
        try {
            // 회장 권한 받는 대상 update
            const newOwner = await executeQueryPromise(
                "UPDATE club_member SET position = ?, admin_ac = ? WHERE member_name = ? AND member_student_id = ? AND category = ?",
                [
                    previousData[0].position,
                    1,
                    newData.name,
                    newData.stId,
                    newData.category
                ]
            );
            if (newOwner.affectedRows === 1) {
                successCount++;
            }

            // 기존 회장 권한 변경
            const changeAdminOfOwner = await executeQueryPromise(
                "UPDATE club_member SET position = ?, admin_ac = ? WHERE member_name = ? AND member_student_id = ? AND category = ?",
                [
                    '부원',
                    0,
                    previousData[0].member_name,
                    previousData[0].member_student_id,
                    newData.category
                ]
            );
            if (changeAdminOfOwner.affectedRows === 1) {
                successCount++;
            }

            // club 테이블 owner 변경
            const changeOwnerTable = await executeQueryPromise(
                "UPDATE club SET club_owner = ? WHERE category = ?",
                [
                    results[0].user_id,
                    newData.category
                ]
            );
            if (changeOwnerTable.affectedRows === 1) {
                successCount++;
            }

            if (successCount === 3) {
                // 모든 쿼리가 성공했을 때
                res.status(200).json({ success: true });
            } else {
                // 일부 쿼리가 실패했을 때
                console.error("일부 쿼리 실패");
                res.status(500).json(resData);
            }

        } catch (err) {
            console.error("권한 위임 실패", err);
            res.status(500).json(resData);
        }
    } else{
        res.status(404).json({ error: "결과가 없습니다." });
    }
};

const memberCount = async (req, res) => {
    try {
        const category = req.query.query;
        const countResult = await executeQueryPromise('SELECT COUNT(*) AS member_count FROM club_member WHERE category = ?;', [category]);

        if (countResult.length === 0) {
            return res.json({ error: "No results found" });
        }

        const memberCount = countResult[0].member_count;
        await executeQueryPromise('UPDATE club SET member_count = ? WHERE category = ?;', [memberCount, category]);

        return res.json({ success: true });
    } catch (error) {
        handleDBError(error);
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
    changeOwner,
    memberCount,
}