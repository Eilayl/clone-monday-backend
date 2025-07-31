const express = require('express');

const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.post('/getitems', dashboardController.getItems); //change to post beacuse error in session
router.post('/createdashboard', dashboardController.createDashboard)
router.post('/delete', dashboardController.deleteDashboard)
router.post('/updategroup', dashboardController.updateGroup)
module.exports = router;