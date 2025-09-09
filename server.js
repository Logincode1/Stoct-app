const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const db = require("./db/connection.js");
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require("express-session");
const isSignedIn = require("./middleware/is-signed-in.js");
const passUserToView = require("./middleware/pass-user-to-view.js");

const authController = require("./controllers/auth.js");
const imagesController = require("./controllers/images.js");

const port = process.env.PORT ? process.env.PORT : "3000";

app.use(express.urlencoded({ extended: false })); // Allows us to parse form data and include in request body
app.use(methodOverride("_method")); // "Tricks" Express into allowing PUT and DELETE requests from forms
app.use(morgan("dev")); // Logger

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passUserToView);

app.get("/", (req, res) => {
  // Check if the user is signed in
  if (req.session.user) {
  // Redirect signed-in users to their images index
  res.redirect("/images");
  } else {
    // Show the homepage for users who are not signed in
    res.render("index.ejs");
  }
});

app.use("/auth", authController);
app.use(isSignedIn);

app.use("/images", imagesController);

db.on("connected", () => {
  console.clear();
  console.log(`Connected to MongoDB.`);
  app.listen(port, () => {
    console.log(`The express app is ready on port ${port}!`);
  });
});

