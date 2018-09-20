const Post = require('../models/post');
const Like = require('../models/like');

exports.updateLikes = (req, res, next) => {
  const userId = req.body.userId;
  const postId = req.body.postId;
  const postsCount = Post.count();

  Like.findOne({userId: userId, postId: postId})
    .then(result => {
      if (result) {
        Like.deleteOne({userId: userId, postId: postId})
          .then(removed => {
            if (removed.n > 0) {
              Post.update({ _id: postId }, { $inc: { likes: -1 } })
                .then(updatedPost => {
                  res.status(200).json({
                    message: 'unlike',
                    postsAmount: +postsCount
                  });
                });
            } else {
              res.status(401).json({
                message: 'Failed to unlike.'
              });
            }
          })
          .catch(error => {
            res.status(401).json({
              message: 'An error was occurred.'
            });
          });
      } else {
        newEntry = Like({ userId: userId, postId: postId });
        newEntry.save()
          .then(entry => {
            Post.update({ _id: postId }, { $inc: {likes: 1} })
              .then(updatedPost => {
                res.status(200).json({
                  message: 'like',
                  postsAmount: +postsCount
                });
              });
          })
          .catch(error => {
            res.status(401).json({
              message: 'Failed to add the new like.'
            });
          });
      }
    });
}
