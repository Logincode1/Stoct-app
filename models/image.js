const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
	title: { type: String, required: true },
	description: { type: String },
	category: {
		type: String,
		enum: ["personal", "professional", "art", "meme"],
	},
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
