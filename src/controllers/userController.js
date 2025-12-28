const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ status: 'success', results: users.length, data: { users } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.updateMe = async (req, res) => {
    try {
        // 1) Filter out unwanted field names that are not allowed to be updated
        const filteredBody = { ...req.body };
        if (req.file) {
            const b64 = req.file.buffer.toString('base64');
            const mime = req.file.mimetype;
            filteredBody.photo = `data:${mime};base64,${b64}`;
        }

        delete filteredBody.password;
        delete filteredBody.role;

        // 2) Update user document
        const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
