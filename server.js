const dotenv = require("dotenv");
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

dotenv.config();

// Session middleware setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.urlencoded({ extended: false })); //Analyzes the body of requests
app.use(methodOverride("_method"));               // Allows PUT and DELETE methods in forms
app.use(morgan("dev"));                           // Logs requests to the console
app.use(express.static(__dirname + '/public'));   // Serve static files from the "public" directory
app.use(passUserToView);                          // Middleware to pass user info to views           
app.use("/auth", authController);                 // Routes for authentication
// Home route
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

app.use(isSignedIn);                              // Middleware to protect routes below  
app.use("/images", imagesController);             // Routes for image management



// Route to render user-profiles.ejs
const User = require("./models/user.js");
app.get("/profiles", async (req, res) => {
  try {
    const users = await User.find({});
    res.render("user-profiles.ejs", { users });
  } catch (err) {
    res.status(500).send("Error fetching users");
  }
});

// Start the server after the database connection is established
db.on("connected", () => {
  console.clear();
  console.log(`Connected to MongoDB.`);
  app.listen(port, () => {
    console.log(`The express app is ready on port ${port}!`);
  });
});

