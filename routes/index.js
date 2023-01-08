// Require express and create a router
const express = require("express");
var router = express.Router();
const Comment = require("../models/comment.js");
const db = require("../models/commentslist.js");

/*
  GET home page.
  This route will render the "index" view, passing in the title "Express"
*/
router.get("/", function (req, res, next) {
	res.render("index", { title: "Express" });
});


/*
  GET comments route
  This route retrieves all comments for a given image ID
*/
router.get("/comments", (req, res) => {
	// Get the image ID from the query parameters
	const imageId = req.query.imageId;
	// Get the comments for the given image ID from the comments list
	const commentsForImage = db.getComments(imageId) || [];
	// Return the comments as a JSON object in the response
	res.status(200).json(commentsForImage);
	res.end();
});


/*
  POST and DELETE comments route
  This route allows clients to add and delete comments for a given image ID
*/
router
	.route("/comments")
	.post((req, res) => {
		// Get the image ID, user name, and comment text from the request body
		const { imageId, userName, commentTxt } = req.body;

		const comment = new Comment(imageId, userName, commentTxt);
		// Add the comment to the list of comments
		db.addComment(comment, imageId);
		// Return the updated list of comments for the image as a JSON object in the response
		res.status(200).json(db.getComments(imageId));
		res.end();
	})
	.delete((req, res) => {
		// Get the image ID and index of the comment to delete from the request body
		const { imageId, indexOfComment } = req.body;

		// Attempt to delete the comment from the list
		const status = db.deleteComment(indexOfComment, imageId);
		// If the comment was successfully deleted, return the updated list of comments for the image as a JSON object in the response
		if (status) res.status(200).json(db.getComments(imageId));
		// If the comment was not successfully deleted, return a JSON object indicating that the response was not modified
		else res.status(304).json("Not Modify");
		res.end();
	});

// Export the router so it can be used in the main app
module.exports = router;