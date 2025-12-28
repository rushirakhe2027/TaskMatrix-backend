const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
        role: {
            type: String,
            enum: ['admin', 'member', 'viewer'],
            default: 'member',
        },
    }],
    price: {
        type: Number,
        default: 0,
    },
    paidAmount: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        enum: ['Design', 'Development', 'Marketing', 'Research', 'Other'],
        default: 'Other',
    },
    deadline: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['active', 'archived', 'deleted', 'completed'],
        default: 'active',
    },
    milestones: [{
        text: String,
        completed: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    attachments: [{
        name: String,
        url: String,
        fileType: String,
        uploadedBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],
}, {
    timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
