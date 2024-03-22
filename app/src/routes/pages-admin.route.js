const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// 회원 목록을 가져오는 라우터
router.get("/pages-admin", (req, res) => {
    pool.getConnection((err, conn) => {
        if (err) {
            console.error('Error connecting to database:', err);
            return res.status(500).send('Database connection error');
        }

        conn.query('SELECT * FROM club_member WHERE category = ?',
            [1],
            (err, members) => {
                if (err) {
                    conn.release(); // 에러 발생 시에도 연결 해제
                    console.error('Error querying database:', err);
                    return res.status(500).send('Database query error');
                }

                // 두 번째 쿼리: 다른 테이블에서 데이터 가져오기
                conn.query('SELECT * FROM club where category = ?',
                    [1],
                    (err, club) => {
                        if (err) {
                            conn.release(); // 에러 발생 시에도 연결 해제
                            console.error('Error querying database:', err);
                            return res.status(500).send('Database query error');
                        }
                    console.log(club[0]);
                    res.render("pages-admin", { members: members, club: club[0] }); // EJS 파일에 데이터 전달하여 렌더링
                });
            });
    });
});

module.exports = router;
