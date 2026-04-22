const multer = require('multer');

// Memory storage (not saving locally)
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
