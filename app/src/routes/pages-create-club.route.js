const express = require("express");
const router = express.Router();
const { verifyToken, verifyTokenAdmin } = require('../controllers/tokenControllers/token.ctrl');
const { setCreateClub, 
    getCreateClubList, 
    deleteClubApplication, 
    getCreateClubApplicationListData,
    getCreateClubApplicationData,
    updateStatus,
    saveEditApplication,
} 
= require('../controllers/create-club.ctrl');

router.get("/create-club", verifyToken, (req, res) => {
    res.render("./createClubApplication/pages-create-club");
});

router.post("/api/create/club/post", setCreateClub);

router.get("/api/create/club/list/get", getCreateClubList);

router.delete("/api/create/club/delete", deleteClubApplication);

router.get("/create-club-admin-access", verifyTokenAdmin, (req, res) => {
    res.render("./createClubApplication/createClubAdminAccess");
});

router.get("/api/create/club/list/admin/get", getCreateClubApplicationListData);

//application_id에 해당하는 한개의 row 데이터만 가져옴.
router.post("/api/create/club/application/data/get", getCreateClubApplicationData);

router.put("/api/create/club/application/data/status/put", updateStatus);

router.put("/api/create/club/application/data/edit/save", saveEditApplication);

module.exports = router;
