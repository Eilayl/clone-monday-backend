const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');
router.post('/signup', authController.signup);
router.get('/getusers', authController.getUsers);
router.get('/signin', authController.getUsers);

module.exports = router;