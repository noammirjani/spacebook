/**
 * Check if the user is logged in, if so, continue to the next middleware function.
 * If not, render the login page with an error message.
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - The next middleware function
 */
exports.checkLogin = (req, res, next) => {
	if (req.session.isLoggedIn) next();
	else {
		if (!req.cookies.connect) {
			res.render("index", {
				title: "Login",
				error: "please sign in",
				newRegistered: "",
			});
		} else {
			text = { msg: "server is down, try again later" };
			res.status(401).json(text);
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
