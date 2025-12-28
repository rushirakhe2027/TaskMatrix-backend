const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Vercel Serverless File System is Read-Only.
// We must use MemoryStorage to prevent crashes.
// Note: Files will NOT be persisted in production without S3/Cloudinary.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (req.baseUrl.includes('projects')) {
        cb(null, true); // Allow all for project attachments
    } else if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

exports.uploadUserPhoto = upload.single('photo');
exports.uploadAvatar = upload.single('avatar');
exports.uploadMessageImage = upload.single('image');
exports.uploadProjectAttachment = upload.single('file');
