const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 } // limit: 5MB per file
});

module.exports = upload;
