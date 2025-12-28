const Project = require('../models/Project');
const Board = require('../models/Board');
const User = require('../models/User');

const updateUserRevenue = async (userId) => {
    const projects = await Project.find({ owner: userId, status: { $ne: 'deleted' } });
    let total = 0;
    let received = 0;

    projects.forEach(p => {
        total += (p.price || 0);
        received += (p.paidAmount || 0);
    });

    await User.findByIdAndUpdate(userId, {
        totalRevenue: total,
        receivedRevenue: received,
        remainingRevenue: total - received
    });
};

exports.createProject = async (req, res) => {
    try {
        const project = await Project.create({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price || 0,
            paidAmount: req.body.paidAmount || 0,
            category: req.body.category || 'Other',
            deadline: req.body.deadline,
            owner: req.user._id,
            members: [{ user: req.user._id, role: 'admin' }],
        });

        // Update user revenue stats
        await updateUserRevenue(req.user._id);

        // Create a default board for the project
        await Board.create({
            name: 'Main Board',
            project: project._id,
            columns: [
                { title: 'To Do', order: 1 },
                { title: 'In Progress', order: 2 },
                { title: 'Done', order: 3 },
            ],
        });

        res.status(201).json({ status: 'success', data: { project } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            'members.user': req.user._id,
            status: 'active'
        }).populate('owner', 'name email avatar');

        res.status(200).json({ status: 'success', results: projects.length, data: { projects } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('members.user', 'name email avatar')
            .populate('owner', 'name email avatar');

        if (!project) return res.status(404).json({ message: 'Project not found' });

        res.status(200).json({ status: 'success', data: { project } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('owner', 'name email avatar').populate('members.user', 'name email avatar');

        if (!project) return res.status(404).json({ message: 'Project not found' });

        // Update revenue stats if price or paidAmount changed
        if (req.body.price !== undefined || req.body.paidAmount !== undefined) {
            await updateUserRevenue(project.owner);
        }

        res.status(200).json({ status: 'success', data: { project } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, { status: 'deleted' });

        if (!project) return res.status(404).json({ message: 'Project not found' });

        await updateUserRevenue(project.owner);

        res.status(204).json({ status: 'success', data: null });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.addMilestone = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        project.milestones.push({ text: req.body.text });
        await project.save();

        res.status(200).json({ status: 'success', data: { project } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.updateMilestone = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const milestone = project.milestones.id(req.params.milestoneId);
        if (!milestone) return res.status(404).json({ message: 'Milestone not found' });

        if (req.body.completed !== undefined) milestone.completed = req.body.completed;
        if (req.body.text) milestone.text = req.body.text;

        await project.save();

        res.status(200).json({ status: 'success', data: { project } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.addAttachment = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Please upload a file' });

        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const attachment = {
            name: req.file.originalname,
            url: `http://localhost:5000/attachments/${req.file.filename}`,
            fileType: req.file.mimetype,
            uploadedBy: req.user._id
        };

        project.attachments.push(attachment);
        await project.save();

        res.status(200).json({ status: 'success', data: { project } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
