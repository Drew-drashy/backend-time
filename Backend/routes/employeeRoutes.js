const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
const { getEmployee ,removeEmployeeFromProject} = require('../controllers/employeeController');


router.get('/employees/:employeeId',protect, getEmployee);
router.delete('/employees/:projectId/:employeeId',protect, removeEmployeeFromProject);


module.exports = router;
