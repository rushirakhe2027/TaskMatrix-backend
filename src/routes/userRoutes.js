const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const { uploadUserPhoto } = require('../middleware/upload');

const router = express.Router();

router.use(protect); // All user routes are protected

router.get('/', userController.getAllUsers);
router.patch('/updateMe', uploadUserPhoto, userController.updateMe);

module.exports = router;
