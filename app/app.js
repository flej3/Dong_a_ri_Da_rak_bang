const express = require("express");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const cors = require("cors");
const app = express();

//라우트 설정
const indexRoutes = require('./src/routes/index.route');
const faqRoutes = require('./src/routes/pages-faq.route');
const loginRoutes = require('./src/routes/pages-login.route');
const registerRoutes = require('./src/routes/pages-register.route');
const usersProfileRoutes = require('./src/routes/users-profile.route');

dotenv.config();

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
app.use(bodyParser.urlencoded({ extended: false }));

//라우팅 미들웨어
app.use(indexRoutes);
app.use(faqRoutes);
app.use(loginRoutes);
app.use(registerRoutes);
app.use(usersProfileRoutes);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views/ejs-file"));

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});