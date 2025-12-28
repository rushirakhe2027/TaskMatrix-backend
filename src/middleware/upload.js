const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest = 'public/img/users'; // default
        if (req.baseUrl.includes('messages')) {
            dest = 'public/img/messages';
        } else if (req.baseUrl.includes('projects')) {
            dest = 'public/attachments';
        }
        ensureDir(dest);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1] || 'bin';
        const prefix = req.baseUrl.includes('messages') ? 'msg' : (req.baseUrl.includes('projects') ? 'att' : 'user');
        const userId = req.user ? req.user._id : 'new';
        cb(null, `${prefix}-${userId}-${Date.now()}.${ext}`);
    }
});

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
