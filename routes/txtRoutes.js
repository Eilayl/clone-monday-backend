const express = require('express');
const multer = require('multer');
const txtController = require('../controllers/txtController');

const router = express.Router();
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      cb(null, true);
    } else {
      cb(new Error('Only DOCX files are allowed!'), false);
    }
  }
}); 


router.post('/readandanalyze', upload.single('docx'), txtController.readandAnalyze);
module.exports = router;