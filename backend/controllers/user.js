const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then(hash => {
    const url = req.protocol + '://' + req.get('host');
    const user = new User({
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      dateOfBirth: req.body.dateOfBirth,
      email: req.body.email,
      password: hash,
      aboutMe: req.body.aboutMe,
      userImage: url + '/images/' + req.file.filename,
      userCountry: req.body.userCountry,
      profession: req.body.profession,
      memberSince: Date.now()
    });
    // console.log(user);
    user.save()
      .then(result => {
        console.log(result);
        res.status(201).json({
        message: 'User created successfully',
        result: result
      });
    })
    .catch(err => {
      res.status(500).json({
      message: 'Invalid authentication credentials.'
      });
    });
  });
}

exports.updateUser = (req, res, next) => {
  const updatedUser = {
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    dateOfBirth: req.body.dateOfBirth,
    email: req.body.email,
    aboutMe: req.body.aboutMe,
    userImage: req.body.userImage,
    userCountry: req.body.userCountry,
    profession: req.body.profession
  };
  // console.log(updatedUser);

  User.findOneAndUpdate({_id: req.params.id}, updatedUser)
    .then(result => {
      if (result) {
        res.status(200).json({
          message: "Update Successfully!"
        });
      } else {
        res.status(401).json({
          message: "Not an authorized user."
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'User update has failed.'
      });
    });
}

exports.loginUser = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email }).then(user => {
    if (!user) {
    return res.status(401).json({message: 'Authentication failed!'});
    }
    fetchedUser = user;
    // The 'compare' function takes the password from the request, hash it and then compares it with the already exist password in the database //
    return bcrypt.compare(req.body.password, user.password);
  })
  .then(result => {
    if (!result) {
      return res.status(401).json({
        message: 'Authentication failed!'
      });
    }
    const token = jwt.sign(
      { email: fetchedUser.email, userId: fetchedUser._id },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
    res.status(200).json({
      token: token,
      expiresIn: 3600,
      userId: fetchedUser._id
    });
  })
  .catch(err => {
      return res.status(401).json({
        message: 'Invalid email and password.'
      });
  });
}

exports.getUsername = (req, res, next) => {
  const username = req.query.username;

  User.findOne({username: username})
    .then(user => {
      if (!user) {
        return res.status(200).json({
          message: 'valid'
        });
      } else {
        // console.log('#### ' + user._id);
        return res.status(401).json({
          message: 'invalid',
          userId: user._id
        });
      }
    })
    .catch(err => {
        return res.status(500).json({
          message: 'Unknown error occurred.'
        });
    });
}

exports.getUserById = (req, res, next) => {
  User.findById(req.params.id)
    .then(user => {
      if (user) {
        res.status(200).json({
         message: 'User found',
         user: user
       });
      } else {
        res.status(401).json({
          message: 'User not found'
        });
      }
    })
    .catch(err => {
      return res.status(500).json({
        message: 'Unknown error occurred.'
      });
    });
}


