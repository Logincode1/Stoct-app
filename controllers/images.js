const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const upload = multer({ dest: "tmp/" });
const User = require("../models/user.js");
const Image = require("../models/image.js");
const Comment = require("../models/comment.js");

//-------------Routes-----------------------

// Show all images for the current user
router.get("/", async (req, res) => {

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

// Show form to create a new image
router.get("/new", (req, res) => {
    res.render("images/new.ejs");
});

// Show details for a single image
router.get("/:imageId", async (req, res) => {
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

// Serve the actual image file
router.get('/:imageId/image', async (req, res) => {
  try {
    const image = await Image.findById(req.params.imageId);
    if (image && image.image && image.image.data) {
      res.contentType(image.image.contentType);
      res.send(image.image.data);
    } else {
      res.status(404).send('Image not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving image');
  }
});

// Handle image upload and creation
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.user._id);
    let imageData = {};
    if (req.file) {
      imageData = {
        data: fs.readFileSync(req.file.path),
        contentType: req.file.mimetype
      };
      // Optionally delete the temp file after reading
      fs.unlinkSync(req.file.path);
    }
    const newImage = await Image.create({
      title: req.body.title,
      image: imageData,
      description: req.body.description,
      category: req.body.category,
      userId: currentUser._id 
    });
    currentUser.images.push(newImage._id); // Push only ObjectId
    await currentUser.save();
    res.redirect("/images");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});


// Delete an image by its ID
router.delete("/:imageId", async (req, res) => {
  try {
    const image = await Image.findById(req.params.imageId);
    if (!image) return res.status(404).send("Image not found");
    if (image.userId.toString() !== req.session.user._id.toString()) {
      return res.status(403).send("Forbidden: You cannot delete this image");
    }
    await Image.findByIdAndDelete(req.params.imageId);
    const currentUser = await User.findById(req.session.user._id);
    currentUser.images.pull(req.params.imageId);
    await currentUser.save();
    res.redirect("/images");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// Show form to edit an existing image
router.get("/:imageId/edit", async (req, res) => {
  try {
    const image = await Image.findById(req.params.imageId);
    if (!image) return res.status(404).send("Image not found");
    if (image.userId.toString() !== req.session.user._id.toString()) {
      return res.status(403).send("Forbidden: You cannot edit this image");
    }
    res.render("images/edit.ejs", {
      image: image,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// Update an image by its ID
router.put("/:imageId", async (req, res) => {
  try {
    const image = await Image.findById(req.params.imageId);
    if (!image) return res.status(404).send("Image not found");
    if (image.userId.toString() !== req.session.user._id.toString()) {
      return res.status(403).send("Forbidden: You cannot update this image");
    }
    await Image.findByIdAndUpdate(req.params.imageId, req.body);
    res.redirect(`/images/${req.params.imageId}`);
  } catch (error) {
    console.log(error);
    res.redirect("/images");
  }
});

// Add a comment to an image
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
