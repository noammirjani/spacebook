const express = require("express");
const commentsController = require("../controllers/comments");
const router = express.Router();

//GET
router.get('/comments/:date',  commentsController.getComments);

//DELETE
router.post('/comments', commentsController.postComment);

//POST
router.delete('/comments', commentsController.deleteComment);

module.exports = router;