const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

const getUserDataFromToken = (req, res, next) => {
    const userData = {};
    try {
        const accessToken = req.cookies.accessToken;
        const tokenUserData = jwt.verify(accessToken, process.env.ACCESS_SECRET);

        userData.isAvailable = true;
        userData.user_id = tokenUserData.id;
        userData.user_name = tokenUserData.name;

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