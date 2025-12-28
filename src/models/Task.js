const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: true,
    },
    board: {
        type: mongoose.Schema.ObjectId,
        ref: 'Board',
        required: true,
    },
    columnId: {
        type: String, // Matches column index or unique id in Board.columns
        required: true,
    },
    assignees: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    }],
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
    },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'done', 'backlog'],
        default: 'todo',
    },
    dueDate: Date,
    category: {
        type: String,
        default: 'General',
    },
    labels: [String],
    attachments: [{
        name: String,
        url: String,
        fileType: String,
    }],
    order: {
        type: Number,
        default: 0,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Soft delete middleware
taskSchema.pre('find', function () {
    this.where({ isDeleted: false });
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
