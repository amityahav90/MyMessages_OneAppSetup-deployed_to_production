const express = require('express');

const extractFile = require('../middleware/file');

const UserController = require('../controllers/user');

const router = express.Router();

router.post('/signup', extractFile, UserController.createUser);

router.post('/login', UserController.loginUser);

router.get('/username', UserController.getUsername);

router.get('/:id', UserController.getUserById);

router.put('/:id', UserController.updateUser);

module.exports = router;
