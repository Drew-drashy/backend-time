const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
const { updateProfile } = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);


router.put('/profile', protect, upload.single('avatar'), updateProfile);

module.exports = router;
