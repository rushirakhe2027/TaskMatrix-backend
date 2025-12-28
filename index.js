const app = require('./src/app');
const mongoose = require('mongoose');
require('dotenv').config();

// Vercel Serverless Entry Point

// Global IO shim to prevent crashes in controllers if they use global.io
// Note: Real-time features via Socket.IO will NOT work on Vercel Serverless
global.io = {
    to: () => ({ emit: () => { } }),
    emit: () => { }
};

let conn = null;

const connectDB = async () => {
    if (conn) return conn;

    // Use env var or default (though env var is required for Vercel)
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
        console.error("MONGO_URI is missing in environment variables!");
        throw new Error("MONGO_URI missing");
    }

    try {
        conn = await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("MongoDB Connected (Vercel)");
        return conn;
    } catch (err) {
        console.error("MongoDB Connection Failed:", err);
        throw err;
    }
};

// Vercel Handler
module.exports = async (req, res) => {
    try {
        await connectDB();
        // Forward to Express App
        return app(req, res);
    } catch (error) {
        console.error("Vercel Function Error:", error);
        res.status(500).json({
            status: 'error',
            message: 'Serverless Function Crashed',
            error: error.message,
            stack: error.stack,
            env_check: {
                HAS_MONGO: !!process.env.MONGO_URI,
                HAS_JWT: !!process.env.JWT_SECRET
            }
        });
    }
};
