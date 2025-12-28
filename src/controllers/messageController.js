const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
    try {
        const messageData = {
            sender: req.user._id,
            recipient: req.body.recipient,
            project: req.body.project,
            text: req.body.text || ' ', // Allow empty text if there is an image
        };

        if (req.file) {
            messageData.attachments = [{
                name: req.file.originalname,
                url: req.file.filename,
                fileType: req.file.mimetype,
            }];
        }

        const message = await Message.create(messageData);

        // Populate sender info for the frontend
        const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatar');

        // Socket logic for real-time delivery
        if (global.io) {
            if (req.body.project) {
                global.io.to(`project_${req.body.project}`).emit('new_project_message', populatedMessage);
            } else if (req.body.recipient) {
                global.io.to(`user_${req.body.recipient}`).emit('new_message', populatedMessage);
            }
        }

        res.status(201).json({ status: 'success', data: { message: populatedMessage } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, recipient: otherUserId },
                { sender: otherUserId, recipient: req.user._id }
            ]
        })
            .populate('sender', 'name avatar')
            .sort('createdAt');

        res.status(200).json({ status: 'success', results: messages.length, data: { messages } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getConversations = async (req, res) => {
    try {
        // Find all unique users the current user has chatted with
        const messages = await Message.find({
            $or: [{ sender: req.user._id }, { recipient: req.user._id }]
        }).sort('-createdAt');

        const conversationPartners = new Set();
        const latestMessages = [];

        messages.forEach(msg => {
            const partnerId = msg.sender.toString() === req.user._id.toString()
                ? msg.recipient.toString()
                : msg.sender.toString();

            if (!conversationPartners.has(partnerId)) {
                conversationPartners.add(partnerId);
                latestMessages.push(msg);
            }
        });

        // This is a simple version, ideally we'd populate and return full user objects
        res.status(200).json({ status: 'success', data: { latestMessages } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getProjectMessages = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const messages = await Message.find({ project: projectId })
            .populate('sender', 'name avatar')
            .sort('createdAt');

        res.status(200).json({ status: 'success', results: messages.length, data: { messages } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
