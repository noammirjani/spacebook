const db = require("../models");
const cookies = require("./cookiesHandler");
const access = require("./checkAccess");
const COOKIE_REGISTER = "register";

/**
 * getLogin - handle the get request for the login page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.renderLoginPage = (req, res) => {
	renderLoginPage(req, res);
};


/**
 * Renders the login page and sends an error message if one exists.
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} errMsg - Error message to be displayed on the login page
 */
function renderLoginPage(req, res, errMsg) {
	res.render("index", {
		title: "Login",
		error: errMsg || "",
		newRegistered: cookies.getCookieText(req, res, COOKIE_REGISTER) || "",
	});
}


/**
 * updateSessionData - update the Session data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} user - User object
 */
function updateSessionData(req, res, user) {
	req.session.user_id = user.id;
	req.session.userName = user.firstName + " " + user.lastName;
	req.session.email = user.email;
	req.session.isLoggedIn = true;
}


/**
 * enterHomePage - logs in a user and renders the api page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.enterHomePage = async (req, res) => {
	try {
		let { email, password } = req.body;

		email = email.toLowerCase();
		if (!email || !password) {
			throw new Error("SORRY - data was not found, try again");
		}

		const user = await db.User.findOne({ where: { email } });
		if (!user) {
			throw new Error("email is not found, please register");
		}

		user.comparePasswords(password);
		updateSessionData(req, res, user);
		res.redirect("/home");
	}
	catch (err) {
		if(access.SequelizeFatalError(err))
			res.render('error', {title:"error - please try later"})
		else
			renderLoginPage(req, res, err.message);
	}
};
