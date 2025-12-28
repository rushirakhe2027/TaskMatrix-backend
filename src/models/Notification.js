const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    type: {
        type: String,
        enum: ['task_assigned', 'comment_added', 'project_update', 'mention'],
        required: true,
    },
    title: String,
    message: String,
    relatedResource: {
        resourceId: mongoose.Schema.ObjectId,
        resourceType: {
            type: String,
            enum: ['Project', 'Board', 'Task'],
        },
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
