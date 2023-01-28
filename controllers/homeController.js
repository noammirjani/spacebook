const db = require("../models");
const Op = require("sequelize");
const access =  require("./checkAccess");

/**
 * Returns an array of comments based on the specified date
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} - An array of comments
 */
exports.getComments = async (req, res) => {
	try {
		date = req.query.date;
		const comments = await getCommentsByDate(date);
		res.status(200).json(comments);
	}
	catch (error) {
		catchError(req,res, error, "failed to load all comments");
	}
};


/**
 * Posts a new comment
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON object containing a message indicating the comment was posted
 */
exports.postComment = async (req, res) => {
	try {
		const {date, text, user_id} = req.body;

		await db.Comments.create({ user_id, text, date})
		res.status(201).json({ msg: "comment posted" });
	}
	catch(error) {
		catchError(req, res, error, "failed to post");
	}
};


/**
 * Deletes a comment
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON object containing a message indicating the comment was deleted
 */
exports.deleteComment = async (req, res) => {
	try {
		const {commentId, text, date} = req.body;

		const comment = await db.Comments.findOne({ where: {
			id:commentId, text:text, user_id: req.session.user_id, date:date}});
		if (!comment) res.status(404).json({ msg: "wanted comment to delete wasn't found" });

		await comment.destroy();
		res.status(201).json({ msg: "comment deleted" });
	}
	catch (error) {
		catchError(req,res, error, "failed to delete");
	}
};


/**
 * catch the api errors and handle them
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} error
 * @param {Object} str
 */
function catchError(req,res,error, str="wanted mission failed"){
	if(access.SequelizeFatalError(error)){
		req.session.isLoggedIn = false;
		res.locals.cookies.title = "error - please try later";
		res.redirected('error');
	}
	else res.status(500).json({code:401, msg: str || error.message});
}


/**
 * Retrieves all comments that were created or updated after the specified time, on the specified date, and not created by the specified user.
 * @function getUpdates
 * @async
 * @param {Date} time - The time to retrieve comments after
 * @param {Date} date - The date to retrieve comments from
 * @param {number} user - The ID of the user to exclude from the retrieved comments
 * @returns {Promise<Array>} - A promise that resolves to an array of comments that match the specified criteria
 */
async function getUpdates(time,date,user){
	return await db.Comments.findAll({
		paranoid: false,
		force: true,
		where:
			{ updatedAt: {[Op.gt]: time},
			date,
			user_id: {[Op.ne]: user},
		},
	});
}


/**
 * Retrieves all comments on the specified date, including the user's first and last name who created the comment
 * @function getCommentsByDate
 * @async
 * @param {Date} date - The date to retrieve comments from
 * @returns {Promise<Array>} - A promise that resolves to an array of comments that match the specified criteria
 */
async function getCommentsByDate(date){
	const temp =  await db.Comments.findAll({ where: { date },
		include: [{model: db.User, attributes:['firstName', 'lastName']}]
	});
	return temp;
}


/**
 * Sends a JSON response containing a boolean indicating whether there are updates, an array of comments, the time of the most recent update, and the number of modifications
 * @function sendPollResponse
 * @param {Object} res - The response object from the Express.js server
 * @param {number} code - The HTTP status code for the response
 * @param {boolean} isUpdate - A boolean indicating whether there are updates
 * @param {Array} comments - An array of comments
 * @param {Date} updateTime - The time of the most recent update
 * @param {number} modifyCount - The number of modifications
 */
function sendPollResponse(res, code, isUpdate, comments, updateTime, modifyCount){
	res.status(code).json({
		isUpdate: isUpdate,
		comments: comments,
		updateTime: updateTime,
		amount: modifyCount
	});
}



/**
 * Polls comments and returns an array of comments that were modified since the last poll
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON object containing an array of comments, update time, and update amount
 */
exports.pollComments = async (req, res) => {
	try {
		const date = req.query.date;
		const time = req.query.lastPollTimestamp;
		const user = req.query.user_id;

		const modify = await getUpdates(time,date,user);

		if (modify.length > 0) {
			const comments = await getCommentsByDate(date)
			newTime = new Date().toUTCString().replace(/\([^()]*\)/g, "")
			sendPollResponse(res, 200, true,comments, newTime, modify.length)
			// res.status(200).json({
			// 	isUpdate: true,
			// 	comments: comments,
			// 	updateTime: , ""),
			// 	amount: modify.length,
			// });
		} else sendPollResponse(res,203, false,[], time, modify.length)
			// res.status(203).json({
			// 	isUpdate: false,
			// 	comments: [],
			// 	updateTime: time,
			// 	amount: 0,
			// });
	} catch (error) {
		catchError(req,res, error);
	}
};


/**
 * getLogin - handle the get request for the login page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getApp = (req, res) => {
	res.render("home", {
		title: "api",
		user_id: req.session.user_id,
		name: req.session.userName,
		email: req.session.email,
	});
};

/**
 * Logs the user out of the application
 *  @function
 *  @param {Object} req - Express request object
 *  @param {Object} res - Express response object
 */
exports.logOut = (req, res) => {
	req.session.isLoggedIn = false;
	res.redirect("/");
};