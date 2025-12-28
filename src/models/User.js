const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false,
    },
    avatar: {
        type: String,
        default: '',
    },
    role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member',
    },
    designation: {
        type: String,
        default: 'Team Member',
    },
    totalRevenue: {
        type: Number,
        default: 0,
    },
    receivedRevenue: {
        type: Number,
        default: 0,
    },
    remainingRevenue: {
        type: Number,
        default: 0,
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    location: {
        type: String,
        default: 'Mumbai, India'
    },
    refreshTokens: [String],
}, {
    timestamps: true,
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
