const express = require("express"),
  mongoose = require("mongoose"),
  methodOverride = require("method-override"),
  bodyParser = require("body-parser");

const app = express();
require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.set("useUnifiedTopology", true);
const url = process.env.MONGODB_URI || 3000;

mongoose.connect(
  url,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  () => {
    console.log("Connected to database.");
  }
);

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/joinUs", (req, res) => {
  res.render("joinUs");
});

app.get("/help", (req, res) => {
  res.render("help");
});

app.get("/adopt", (req, res) => {
  res.render("adopt");
});

app.get("/donate", (req, res) => {
  res.render("donate");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signUp");
});

app.get("/contacts", (req, res) => {
  res.render("contacts");
});

let port = process.env.PORT || 3000;
app.listen(port, process.env.IP, () => {
  console.log("showing on port 3000.");
});
