const express = require('express');
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(taskController.createTask);

router.route('/board/:boardId')
    .get(taskController.getBoardTasks);

router.get('/my-tasks', taskController.getMyTasks);

router.route('/:id')
    .patch(taskController.updateTask)
    .delete(taskController.deleteTask);

module.exports = router;
