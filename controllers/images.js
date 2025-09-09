const express = require("express");
const router = express.Router();

const User = require("../models/user.js");

router.get("/", async (req, res) => {
  // Show all images for the current user
  try {
    const currentUser = await User.findById(req.session.user._id);

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
    const currentUser = await User.findById(req.session.user._id);
    const imageData = currentUser.images.id(
      req.params.imageId
    );

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
    currentUser.images.push(req.body); // Assuming req.body is structured correctly for images

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
    currentUser.images.id(req.params.imageId).deleteOne(); // Assuming this is correct for images

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
    const currentUser = await User.findById(req.session.user._id);
    const image = currentUser.images.id(req.params.imageId);
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
  const currentUser = await User.findById(req.session.user._id);
  const image = currentUser.images.id(req.params.imageId);

  image.set(req.body);

  await currentUser.save();

    res.redirect(`/images/${req.params.imageId}`);
});

module.exports = router;
