const express = require("express");
const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const app = express();

dotenv.config();

app.use(express.json());
// app.use(express.static(path.join(__dirname, "views")));
app.use('/assets', express.static(path.join(__dirname, 'src/views', 'assets')));
app.use('/forms', express.static(path.join(__dirname, 'src/views', 'forms')));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views/ejs-file"));

app.get("/", (req, res)=>{
  res.render("index");
});

app.get("/users-profile", (req, res)=>{
  res.render("users-profile");
});

app.get("/pages-faq", (req, res)=>{
  res.render("pages-faq");
});

app.get("/pages-login", (req, res)=>{
  res.render("pages-login");
});

app.get("/pages-register", (req, res)=>{
  res.render("pages-register");
});

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});