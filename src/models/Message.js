const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false,
    },
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: false,
    },
    text: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    attachments: [{
        name: String,
        url: String,
        fileType: String,
    }],
}, {
    timestamps: true,
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
