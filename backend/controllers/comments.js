const CommentLike = require('../models/comment-like');
const Comment = require('../models/comment');
const User = require('../models/user');

exports.createComment = (req, res, next) => {
  User.findOne({_id: req.body.authorId})
    .then(user => {
      if (!user) {
        res.status(401).json({
          message: 'Cannot find user.'
        });
      }

      const comment = new Comment({
        authorId: req.body.authorId,
        username: user.username,
        postId: req.body.postId,
        likes: 0,
        date: req.body.date,
        content: req.body.content,
        authorImage: user.userImage
      });
      console.log(comment);
      comment.save()
        .then(createdComment => {
          res.status(201).json({
            message: 'Comment added successfully!',
            comment: {
              ...createdComment,
              _id: createdComment._id
            }
          });
        })
        .catch(error => {
          res.status(500).json({
            message: 'Comment creation has failed.'
          });
        });
    });
}

exports.getAllCommentsOfPost = (req, res, next) => {
  Comment.find({postId: req.params.id})
    .then(foundComments => {
      if (!foundComments) {
        res.status(401).json({
          message: 'No comments for this post.'
        });
      }
      console.log(foundComments);
      res.status(200).json({
        message: 'Found comments successfully.',
        comments: foundComments
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'An unknown error occurred.'
      });
    });
}

exports.updateComment = (req, res, next) => {
  Comment.findOneAndUpdate({_id: req.params.id}, {content: req.body.content}, {new: true})
    .then(result => {
      if (result) {
        res.status(200).json({
          message: 'Comment updated successfully.',
          comment: result
        });
      } else {
        res.status(401).json({
          message: 'Failed to update comment.'
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'An unknown error occurred.'
      });
    });
}

exports.updateLikes = (req, res, next) => {
  CommentLike.findOne({userId: req.body.userId, commentId: req.body.commentId})
    .then(result => {
      if (result) {
        CommentLike.deleteOne({userId: req.body.userId, commentId: req.body.commentId})
          .then(deletedRecord => {
            if (deletedRecord.n > 0) {
              Comment.findOneAndUpdate({ _id: req.body.commentId }, { $inc: { likes: -1 } })
                .then(updatedComment => {
                  res.status(200).json({
                    message: 'unlike'
                  });
                })
            } else {
              res.status(401).json({
                message: 'Failed to unlike.'
              });
            }
          })
          .catch(error => {
            res.status(500).json({
              message: 'Unknown error occurred.'
            });
          });
      } else {
        const newEntry = new CommentLike({
          userId: req.body.userId,
          commentId: req.body.commentId
        });

        newEntry.save()
          .then(savedRecord => {
            if (savedRecord) {
              Comment.findOneAndUpdate({_id: req.body.commentId}, { $inc: {likes: 1} })
                .then(updatedComment => {
                  res.status(200).json({
                    message: 'like'
                  });
                })
                .catch(error => {
                  res.status(500).json({
                    message: 'Unknown error occurred.'
                  });
                })
            }
          })
      }
    })
}

exports.deleteComment = (req, res, next) => {
  Comment.findOneAndDelete({_id: req.params.id})
    .then(deletedComment => {
      if (deletedComment) {
        CommentLike.deleteMany({commentId: req.params.id})
          .then(result => {
            res.status(200).json({
              message: 'Comment deleted successfully.'
            });
          })
      } else {
        res.status(401).json({
          message: 'Cannot delete comment.'
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Unknown error occurred.'
      });
    })
}
