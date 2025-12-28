const Board = require('../models/Board');
const Project = require('../models/Project');

exports.getProjectBoards = async (req, res) => {
    try {
        const boards = await Board.find({ project: req.params.projectId });
        res.status(200).json({ status: 'success', results: boards.length, data: { boards } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.createBoard = async (req, res) => {
    try {
        const board = await Board.create({
            name: req.body.name,
            project: req.body.projectId,
            columns: req.body.columns || [
                { title: 'To Do', order: 1 },
                { title: 'In Progress', order: 2 },
                { title: 'Done', order: 3 },
            ],
        });
        res.status(201).json({ status: 'success', data: { board } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.updateBoard = async (req, res) => {
    try {
        const board = await Board.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!board) return res.status(404).json({ message: 'Board not found' });
        res.status(200).json({ status: 'success', data: { board } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
