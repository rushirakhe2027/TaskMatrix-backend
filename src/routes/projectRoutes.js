const express = require('express');
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

const { uploadProjectAttachment } = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(projectController.getAllProjects)
    .post(projectController.createProject);

router.route('/:id')
    .get(projectController.getProject)
    .patch(projectController.updateProject)
    .delete(projectController.deleteProject);

router.post('/:id/milestones', projectController.addMilestone);
router.patch('/:id/milestones/:milestoneId', projectController.updateMilestone);
router.post('/:id/attachments', uploadProjectAttachment, projectController.addAttachment);

module.exports = router;
