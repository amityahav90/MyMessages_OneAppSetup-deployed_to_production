const Post = require('../models/post');
const User = require('../models/user');

exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  let post;

  User.findOne({_id: req.userData.userId})
    .then(user => {
      if (user) {
        post = new Post({
          topic: req.body.topic,
          title: req.body.title,
          content: req.body.content,
          imagePath: url + '/images/' + req.file.filename,
          creator: req.userData.userId,
          creatorUsername: user.username
        });

        post.save()
          .then(createdPost => {
            res.status(201).json({
              message: 'Post added successfully!',
              post: {
                ...createdPost,
                id: createdPost._id
              }
            });
          })
          .catch(error => {
            res.status(500).json({
              message: 'Post creation has failed.'
            });
          });
      } else {
        res.status(401).json({
          message: 'User with that ID is not exist.'
        });
      }
    });
}

exports.updatePost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    topic: req.body.topic,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then(result => {
    if (result.n > 0) {
    res.status(200).json({message: "Update Successfully!"});
  } else {
    res.status(401).json({message: "Not an authorized user."});
  }
})
.catch(error => {
    res.status(500).json({
    message: 'Post update has failed.'
  });
});
}

exports.getPosts = (req, res, next) => {
  // console.log(req.query.filter);
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  let postQuery;
  if (req.query.filter) {
    const splittedFilters = req.query.filter.split(',');
    postQuery = Post.find({topic: {$in: splittedFilters}});
  } else {
    postQuery = Post.find();
  }
  let fetchedPosts;

  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }

  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then(count => {
        res.status(200).json({
          message: 'Posts fetched successfully!',
          posts: fetchedPosts,
          maxPosts: count
      });
    })
    .catch(error => {
        res.status(500).json({
          message: 'Fetching posts failed.'
        });
    });
}

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({message: 'Post not found!'});
}
}).catch(error => {
    res.status(500).json({
    message: 'Fetching post failed.'
  });
});
}

exports.deletePost = (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(result => {
    if (result.n > 0) {
    res.status(200).json({message: "Deleted Successfully!"});
  } else {
    res.status(401).json({message: "Not an authorized user!"});
  }
}).catch(error => {
    res.status(500).json({
    message: 'Post deletion failed.'
  });
});
}
