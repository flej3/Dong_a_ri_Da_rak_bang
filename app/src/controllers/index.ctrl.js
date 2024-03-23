const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const pool = require("./../config/database");
const { handleDBError } = require("./login.ctrl");

dotenv.config();

function isClubOwner(userId) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            if (err) {
                handleDBError(err, conn);
                return reject(err);
            }

            conn.query("SELECT * FROM club WHERE club_owner = ?",
                [userId],
                (err, result)=>{
                    if(err){
                        handleDBError(err, conn);
                        return reject(err);
                    }
                    conn.release();
                    if(result.length === 0){
                        return resolve({isOwner: false});
                    }
                    return resolve({ isOwner: true, clubData: result[0] });
                }
            )
        });
    });
}

const getUserDataFromToken = async (req, res, next) => {
    const userData = {};
    try {
        const accessToken = req.cookies.accessToken;
        const tokenUserData = jwt.verify(accessToken, process.env.ACCESS_SECRET);

        userData.isAvailable = true;
        userData.user_id = tokenUserData.id;
        userData.user_name = tokenUserData.name;

        const clubData = await isClubOwner(userData.user_id);
        userData.clubData = clubData;

        res.locals.userData = userData;
        next();
    } catch (error) {
        userData.isAvailable = false;
        res.locals.userData = userData;
        next();
    }
}

module.exports = {
    getUserDataFromToken,
}