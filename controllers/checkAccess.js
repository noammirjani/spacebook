const {Sequelize} = require("sequelize");
const db = require("../models");
const SERVER_ERROR='OOPS ACTION FAILED \n SOMETHING HAPPENED TO DATA BASE, \n SERVER IS OFF FOR NOW';

/**
 * Check if the user is logged in, if so, continue to the next middleware function.
 * If not, render the login page with an error message.
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - The next middleware function
 */
exports.checkLogin = (req, res, next) => {
	if (req.session.isLoggedIn) {
		next();
	}
	else {
		if (!req.cookies.connect) {
			res.render("index", {
				title: "Login",
				error: "please sign in",
				newRegistered: "",
			});
		} else {
			let responseText = { msg: "server is down, try again later" };
			res.status(401).json(responseText);
		}
	}
};


/**
 * Check if the user is logged out, if so, continue to the next middleware function.
 * If not, redirect to the homepage.
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - The next middleware function
 */
exports.checkLogout = (req, res, next) => {
	if (req.session.isLoggedIn) {
		res.redirect("/home");
	} else {
		next();
	}
};


/**
 * Set the 'Cache-Control' header to prevent caching.
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - The next middleware function
 */
exports.nocache = (req, res, next) => {
	res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0,max-age=0,s-maxage=0");
	next();
};


/** 'SequelizeFatalError'
 * @function
 * @param {Object} err
 * @return {string}
 */
exports.SequelizeFatalError = (err) => {
	if (err instanceof Sequelize.DatabaseError ||
		err instanceof Sequelize.ConnectionError) {
		return SERVER_ERROR;
	}
	return "";
};


/** 'SequelizeUsersTableValidAccess' - checks if the table  */
exports.SequelizeUsersTableValidAccess = () => {
	db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Users'", (err, row) => {
		if (err || !row) {
			throw new Error('users database is down for now');
		}
	});
}


/** 'SequelizeCommentsTableValidAccess' - checks if the table  */
exports.SequelizeCommentsTableValidAccess = () => {
	db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Comments'", (err, row) => {
		if (err || !row) {
			throw new Erorr('comments database is down for now');
		}
	});
}