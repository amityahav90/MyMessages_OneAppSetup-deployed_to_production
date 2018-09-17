const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  topic: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  imagePath: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creatorUsername: { type: String, required: true },
  likes: { type: Number, default: 0 }
});

module.exports = mongoose.model('Post', postSchema);
