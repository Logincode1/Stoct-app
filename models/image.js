const mongoose = require("mongoose");
const imageSchema = new mongoose.Schema({
	title: { type: String, required: true },
	image: {
		data: Buffer,
		contentType: String
	},
	description: { type: String },
	category: {
		type: String,
		enum: ["personal", "professional", "art", "meme"],
	},
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});
const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
