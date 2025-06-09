const express = require('express');
const { register, login, getProfile,forgotPassword,resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
const { updateProfile } = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.post('/forgot-password',forgotPassword);
router.post('/reset-password',resetPassword);

router.put('/profile', protect, upload.single('avatar'), updateProfile);

module.exports = router;
