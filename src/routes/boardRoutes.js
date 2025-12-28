const express = require('express');
const boardController = require('../controllers/boardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(boardController.createBoard);

router.route('/project/:projectId')
    .get(boardController.getProjectBoards);

router.route('/:id')
    .patch(boardController.updateBoard);

module.exports = router;
