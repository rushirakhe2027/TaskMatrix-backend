const express = require('express');
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const { uploadMessageImage } = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/conversations', messageController.getConversations);
router.get('/:userId', messageController.getMessages);
router.get('/project/:projectId', messageController.getProjectMessages);
router.post('/', uploadMessageImage, messageController.sendMessage);

module.exports = router;
