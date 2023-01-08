// use the module pattern to handle a dict of comments
module.exports = (function () {
	// private data
	let comments = {};

	// private methods
	function addComment(newComment, imageId) {
		if (!comments.hasOwnProperty(imageId)) {
			comments[imageId] = [];
		}

		comments[imageId].push(newComment);
	}

	function deleteComment(indexOfComment, imageId) {
		const commentsForImage = comments[imageId] || null;
		if (commentsForImage === null) return false;

		const commentToDelete = commentsForImage[indexOfComment] || null;
		if (commentToDelete === null) return false;

		commentsForImage.splice(indexOfComment, 1);
		return true;
	}

	function getImgComments(imgId) {
		return comments[imgId];
	}

	// public API
	return {
		addComment: addComment,
		deleteComment: deleteComment,
		getComments: getImgComments,
	};
})();
