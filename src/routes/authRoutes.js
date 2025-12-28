const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middleware/auth');

const { uploadAvatar } = require('../middleware/upload');

router.post('/signup', uploadAvatar, authController.signup);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.get('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
