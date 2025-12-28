const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Board name is required'],
        trim: true,
    },
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: true,
    },
    columns: [{
        title: { type: String, required: true },
        order: { type: Number, default: 0 },
    }],
}, {
    timestamps: true,
});

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;
