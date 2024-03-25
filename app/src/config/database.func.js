const pool = require("./database");

// 데이터베이스에서 쿼리를 실행하고 결과를 처리하는 함수
const executeQuery = (query, params, callback) => {
    pool.getConnection((err, conn) => {
        if (err) {
            console.error('Error connecting to database:', err);
            return callback(err, null); // 콜백 함수에 에러 전달
        }

        conn.query(query, params, (err, result) => {
            conn.release(); // 연결 해제

            if (err) {
                console.error('Error querying database:', err);
                return callback(err, null); // 콜백 함수에 에러 전달
            }

            callback(null, result); // 콜백 함수에 결과 전달
        });
    });
};

module.exports = {
    executeQuery,
}