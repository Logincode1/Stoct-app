const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user.js");

//-------------Routes-----------------------

// Render sign-up page
router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs");
});
// Render sign-in page
router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in.ejs");
});
// Handle user sign-out
router.get("/sign-out", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Handle user sign-up
router.post("/sign-up", async (req, res) => {
  try {
    // Check if the username is already taken
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (userInDatabase) {
      return res.send("Username already taken.");
    }

    // Check if the password and confirm password match
    if (req.body.password !== req.body.confirmPassword) {
      return res.send("Password and Confirm Password must match");
    }

    // Hash the password before sending to the database
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hashedPassword;

    // All ready to create the new user!
    await User.create(req.body);
    res.redirect("/auth/sign-in");
  }
  catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// Handle user sign-in
router.post("/sign-in", async (req, res) => {
  try {
    // First, get the user from the database
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (!userInDatabase) {
      return res.send("Login failed. Please try again.");
    }

    // Password check
    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    );
    if (!validPassword) {
      return res.send('<script>alert("Login failed. Please try again."); window.location.href="/auth/sign-in";</script>');
    }

    // User is authenticated
    // Avoid storing the password, even in hashed format, in the session
    // If there is other data you want to save to `req.session.user`
    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id,
    };

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// Export the router to be used in server.js
module.exports = router;
