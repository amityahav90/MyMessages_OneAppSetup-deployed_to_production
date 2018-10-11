const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
  authorId: { type: String, required: true },
  username: { type: String, required: true },
  postId: { type: String, required: true },
  likes: { type: Number, required: true },
  date: { type: Date, required: true },
  content: { type: String, required: true },
  authorImage: { type: String, required: true }
});

module.exports = mongoose.model('Comment', commentSchema);
