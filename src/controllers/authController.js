const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id, secret, expires) => {
    return jwt.sign({ id }, secret, { expiresIn: expires });
};

const createSendToken = async (user, statusCode, res) => {
    const token = signToken(user._id, process.env.JWT_SECRET || 'fallback_secret_key', process.env.JWT_EXPIRES_IN || '90d');
    const refreshToken = signToken(user._id, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret', process.env.JWT_REFRESH_EXPIRES_IN || '90d');

    // Store refresh token in user
    user.refreshTokens.push(refreshToken);
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    };

    res.cookie('token', token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        refreshToken,
        data: { user },
    });
};

exports.signup = async (req, res) => {
    try {
        let photo = 'default.jpg';
        if (req.file) {
            const b64 = req.file.buffer.toString('base64');
            const mime = req.file.mimetype;
            photo = `data:${mime};base64,${b64}`;
        }

        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            photo: photo,
            avatar: photo,
        });

        await createSendToken(newUser, 201, res);
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password, user.password))) {
            return res.status(401).json({ message: 'Incorrect email or password' });
        }

        await createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || !user.refreshTokens.includes(refreshToken)) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const newToken = signToken(user._id, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN);
        res.status(200).json({ status: 'success', token: newToken });
    } catch (err) {
        res.status(403).json({ message: 'Refresh token invalid' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ status: 'success', data: { user } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.logout = async (req, res) => {
    res.cookie('token', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
};
