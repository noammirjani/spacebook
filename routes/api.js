const express = require("express");
const apiController = require("../controllers/api");
const loginController = require("../controllers/login");
const router = express.Router();

/**
 * Handle GET request to the root route
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get("/", apiController.getApp);

/**
 * Handle GET request for logout
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get("/logout", apiController.logOut);

/**
 * Handle GET request for comments
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get("/comments", apiController.getComments);

/**
 * Handle GET request for poll comments
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get("/poll-comments", apiController.pollComments);

/**
 * Handle POST request for comments
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post("/comments", apiController.postComment);

/**
 * Handle DELETE request for comments
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.delete("/comments", apiController.deleteComment);

module.exports = router;
