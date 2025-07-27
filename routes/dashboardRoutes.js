const express = require('express');

const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.post('/additem', dashboardController.additem);  
router.post('/getitems', dashboardController.getItems); //change to post beacuse error in session
module.exports = router;