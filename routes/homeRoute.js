const express = require("express");
const homeController = require("../controllers/homeController");
const router = express.Router();

/**
 * Handle GET request to the root route
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get("/", homeController.getApp);

/**
 * Handle GET request for logout
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get("/logout", homeController.logOut);

/**
 * Handle GET request for comments
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get("/comments", homeController.getComments);

/**
 * Handle GET request for poll comments
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get("/poll-comments", homeController.pollComments);

/**
 * Handle POST request for comments
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post("/comments", homeController.postComment);

/**
 * Handle DELETE request for comments
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.delete("/comments", homeController.deleteComment);

module.exports = router;
