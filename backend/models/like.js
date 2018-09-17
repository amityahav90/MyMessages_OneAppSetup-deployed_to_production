const mongoose = require('mongoose');

const likeSchema = mongoose.Schema({
  userId: { type: String, required: true },
  postId: { type: String, required: true }
});

module.exports = mongoose.model('Like', likeSchema);
