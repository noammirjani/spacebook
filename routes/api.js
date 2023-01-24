const express = require("express");
const commentsController = require("../controllers/api");
const router = express.Router();

//GET
router.get('/comments/:date',
    commentsController.getComments);

router.get('/comments?date&lastPollTimestamp',
    commentsController.pollComments);

//DELETE
router.post('/comments',
    commentsController.postComment);

//POST
router.delete('/comments',
    commentsController.deleteComment);

module.exports = router;