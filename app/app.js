const express = require("express");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const { refreshTokenMiddleware } = require('./src/controllers/tokenControllers/token.ctrl');
const { getUserDataFromToken } = require('./src/controllers/index.ctrl');

const app = express();

dotenv.config();

//라우트 설정
const indexRoutes = require('./src/routes/index.route');
const faqRoutes = require('./src/routes/pages-faq.route');
const loginRoutes = require('./src/routes/pages-login.route');
const activeRoutes = require('./src/routes/user-active.route');
const registerRoutes = require('./src/routes/pages-register.route');
const usersProfileRoutes = require('./src/routes/users-profile.route');
const writePostRoutes = require('./src/routes/post/postRecruit/write-post.route');
const clubAdminRoutes = require('./src/routes/pages-clubAdmin.route');
const searchRoutes = require('./src/routes/search/search.route');
const viewPostRoutes = require('./src/routes/post/postRecruit/view-post.route');
const indexPostDashboard = require('./src/routes/post/index.postDashboard.route');
const clubProfile = require('./src/routes/page-club-profile/page-club-profile.route');
const pageError = require('./src/routes/page-error.route');
const editPostRoutes = require('./src/routes/post/postRecruit/edit-post.route');
const recruitCommentRoutes = require('./src/routes/comments/recruit_comments/recruit_comment.route');
const recruitPostJoinClubRoutes = require('./src/routes/post/postRecruit/join-club/join_club.route');
const indexClubJoinDashboardRoutes = require('./src/routes/post/postRecruit/join-club/index.clubJoinDashboard.route');
const createClubRoutes = require('./src/routes/pages-create-club.route');
const clubListRoutes = require('./src/routes/pages-club-list.route');
const clubIntroductionRoutes = require('./src/routes/clubIntroduction/pages-clubIntroduction.route');
const findIdPwRoutes = require('./src/routes/find-ID-PW/page-find-id-pw.route');

//미들웨어
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use('/assets', express.static(path.join(__dirname, 'src/views', 'assets')));
app.use('/forms', express.static(path.join(__dirname, 'src/views', 'forms')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/' , refreshTokenMiddleware); // "/"경로 이하로 접근 할때마다 AccessToken 재발급

//userData객체를 담아서 프론트로 던지고 시작. 그래서 userData 객체에 접근 가능한거임.
app.use(getUserDataFromToken);

//라우팅 미들웨어
app.use(indexRoutes);
app.use(faqRoutes);
app.use(loginRoutes);
app.use(registerRoutes);
app.use(usersProfileRoutes);
app.use(writePostRoutes);
app.use(clubAdminRoutes);
app.use(searchRoutes);
app.use(viewPostRoutes);
app.use(indexPostDashboard);
app.use(editPostRoutes);
app.use(clubProfile);
app.use(pageError);
app.use(recruitCommentRoutes);
app.use(recruitPostJoinClubRoutes);
app.use(indexClubJoinDashboardRoutes);
app.use(createClubRoutes);
app.use(clubListRoutes);
app.use(clubIntroductionRoutes);
app.use(activeRoutes);
app.use(findIdPwRoutes);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views/ejs-file"));

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});