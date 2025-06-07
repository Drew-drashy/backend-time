const express = require('express');
const { startSession, endSession, getLogs, getLogsByAdmin } = require('../controllers/timeTrackingController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/time/start', protect, startSession);
router.post('/time/end', protect, endSession);
router.get('/time/logs', protect, getLogs);
router.get('/time/logs/admin/:employeeId', protect, getLogsByAdmin);
module.exports = router;
