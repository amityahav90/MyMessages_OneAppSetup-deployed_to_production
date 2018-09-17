const express = require('express');

const LikesController = require('../controllers/likes');

const router = express.Router();

router.post("", LikesController.updateLikes);

module.exports = router;
