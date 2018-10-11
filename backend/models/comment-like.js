const mongoose = require('mongoose');

const commentLikeSchema = mongoose.Schema({
  userId: { type: String, required: true },
  commentId: { type: String, required: true }
});

module.exports = mongoose.model('CommentLike', commentLikeSchema);
