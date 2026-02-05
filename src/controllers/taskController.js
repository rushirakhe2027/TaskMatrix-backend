const Task = require('../models/Task');
const Notification = require('../models/Notification');
const Project = require('../models/Project');

exports.createTask = async (req, res) => {
    try {
        console.log('--- CREATE TASK START ---');
        console.log('Request Body:', JSON.stringify(req.body, null, 2));

        const taskData = {
            title: req.body.title,
            description: req.body.description || '',
            project: req.body.project || req.body.projectId,
            board: req.body.board || req.body.boardId,
            columnId: req.body.columnId,
            order: req.body.order || 0,
            priority: req.body.priority || 'medium',
            status: req.body.status || 'todo'
        };

        console.log('Mapped Task Data:', JSON.stringify(taskData, null, 2));

        if (!taskData.project || !taskData.board || !taskData.columnId) {
            console.error('MISSING REQUIRED FIELDS:', {
                project: taskData.project,
                board: taskData.board,
                columnId: taskData.columnId
            });
            return res.status(400).json({
                status: 'fail',
                message: 'Missing required fields: project, board, or columnId'
            });
        }

        const task = await Task.create(taskData);
        console.log('Task Created ID:', task._id);

        // Emit socket event
        if (global.io) {
            const roomName = `project_${task.project.toString()}`;
            console.log('Emitting task_created to room:', roomName);
            global.io.to(roomName).emit('task_created', task);
        }

        // Notification logic
        if (req.body.assignees && req.body.assignees.length > 0) {
            try {
                const notifications = req.body.assignees.map(userId => ({
                    recipient: userId,
                    sender: req.user._id,
                    type: 'task_assigned',
                    title: 'New Task Assigned',
                    message: `You have been assigned to task: ${task.title}`,
                    relatedResource: { resourceId: task._id, resourceType: 'Task' }
                }));
                await Notification.insertMany(notifications);

                req.body.assignees.forEach(userId => {
                    global.io.to(`user_${userId}`).emit('notification', {
                        type: 'task_assigned',
                        message: `You have been assigned to task: ${task.title}`
                    });
                });
            } catch (notifyErr) {
                console.error('Notification Error (non-fatal):', notifyErr);
            }
        }

        res.status(201).json({ status: 'success', data: { task } });
    } catch (err) {
        console.error('--- CREATE TASK ERROR ---');
        console.error(err);
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getBoardTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ board: req.params.boardId })
            .populate('assignees', 'name email avatar')
            .sort('order');
        res.status(200).json({ status: 'success', results: tasks.length, data: { tasks } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!task) return res.status(404).json({ message: 'Task not found' });

        if (global.io) {
            global.io.to(`project_${task.project.toString()}`).emit('task_updated', task);
        }

        res.status(200).json({ status: 'success', data: { task } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, { isDeleted: true });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        if (global.io) {
            global.io.to(`project_${task.project.toString()}`).emit('task_deleted', { id: task._id });
        }

        res.status(204).json({ status: 'success', data: null });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getMyTasks = async (req, res) => {
    try {
        // Find all projects where the user is a member
        const userProjects = await Project.find({ 'members.user': req.user._id });
        const projectIds = userProjects.map(p => p._id);

        // Find all tasks in those projects
        const tasks = await Task.find({ project: { $in: projectIds } })
            .populate('project', 'name')
            .populate('assignees', 'name email avatar')
            .sort('-createdAt');
            
        res.status(200).json({ status: 'success', results: tasks.length, data: { tasks } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
