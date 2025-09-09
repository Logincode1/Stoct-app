const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: {
    type: String,
    enum: ["Personal", "Professional", "art", "meme"],
  },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  images: [imageSchema],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
