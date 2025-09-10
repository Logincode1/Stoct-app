// Add a comment to an image

const express = require("express");
const router = express.Router();


const User = require("../models/user.js");
const Image = require("../models/image.js");
const Comment = require("../models/comment.js");

router.get("/", async (req, res) => {
  // Show all images for the current user
  try {
    const currentUser = await User.findById(req.session.user._id).populate("images");
    res.render("images/index.ejs", {
      images: currentUser.images,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.get("/new", (req, res) => {
  // Show form to create a new image
    res.render("images/new.ejs");
});

router.get("/:imageId", async (req, res) => {
  // Show details for a single image
  try {
    const imageData = await Image.findById(req.params.imageId).populate("comments");
    res.render("images/show.ejs", {
      image: imageData,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.post("/", async (req, res) => {
  // Create a new image for the current user
  try {
    const currentUser = await User.findById(req.session.user._id);
    const newImage = await Image.create(req.body);
    currentUser.images.push(newImage._id); // Push only ObjectId
    await currentUser.save();
    res.redirect("/images");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.delete("/:imageId", async (req, res) => {
  // Delete an image by its ID
  try {
    const currentUser = await User.findById(req.session.user._id);
    await Image.findByIdAndDelete(req.params.imageId);
    currentUser.images.pull(req.params.imageId);
    await currentUser.save();
    res.redirect("/images");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.get("/:imageId/edit", async (req, res) => {
  // Show form to edit an existing image
  try {
    const image = await Image.findById(req.params.imageId);
    res.render("images/edit.ejs", {
      image: image,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

router.put("/:imageId", async (req, res) => {
  // Update an image by its ID
  try {
    await Image.findByIdAndUpdate(req.params.imageId, req.body);
    res.redirect(`/images/${req.params.imageId}`);
  } catch (error) {
    console.log(error);
    res.redirect("/images");
  }
});


router.post("/:imageId/comments", async (req, res) => {
  try {
    const image = await Image.findById(req.params.imageId);
    const comment = await Comment.create({
      text: req.body.text,
      author: req.session.user._id
    });
    image.comments.push(comment._id);
    await image.save();
    res.redirect(`/images/${req.params.imageId}`);
  } catch (error) {
    console.log(error);
    res.redirect(`/images/${req.params.imageId}`);
  }
});
module.exports = router;
