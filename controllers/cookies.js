/**
 * getCookieText - gets the text from the cookie, clears it and return the data.
 * @param {Object} res - Express response object
 * @param {Object} req - Express response object
 * @param {string} key - the cookie key
 */
exports.getCookieText = (req, res, key) => {
	const text = req.cookies[key];
	if (text) {
		res.clearCookie(key);
	}
	return text;
};

/**
 * getCookieData - gets the data stored in the user cookie as string
 * @param {Object} req - Express request object
 * @param cookieKey
 * @returns {Object} the data stored in the cookie
 */
exports.getCookieData = (req, cookieKey) => {
	const cookie = req.cookies[cookieKey];
	if (cookie) {
		return JSON.parse(cookie);
	}
	throw new Error("your time expired");
};

/**
 * Check if a cookie exists in the request
 * @param {Object} req - The request object
 * @param {string} cookieKey - The key of the cookie to check for
 * @returns {boolean} - A boolean indicating if the cookie exists
 */
exports.isCookieExists = (req, cookieKey) => {
	return !!req.cookies[cookieKey];
};

/**
 * Clear a cookie from the response
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {string} cookieKey - The key of the cookie to clear
 */
exports.clear = (req, res, cookieKey) => {
	if (req.cookies[cookieKey]) {
		res.clearCookie(cookieKey);
	}
};
