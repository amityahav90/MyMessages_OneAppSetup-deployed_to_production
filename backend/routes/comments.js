const express = require('express');

const CommentsController = require('../controllers/comments');

const router = express.Router();

// Get all comments of the specified post ID //
router.get("/:id", CommentsController.getAllCommentsOfPost);

// Create new commentInput //
router.post("", CommentsController.createComment);

// Update one comment. Update content and likes //
router.put("/:id", CommentsController.updateComment);

// Update likes of comment //
router.post("/like", CommentsController.updateLikes);

// Delete specific comment //
router.delete("/:id", CommentsController.deleteComment);

module.exports = router;
