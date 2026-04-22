const express = require("express");
const router = express.Router();
const uploadController = require("../../controllers/upload.controller");
const { verifyToken } = require("../../middlewares/token");
const upload = require("../../middlewares/multer");

// Store Merchant details
router.post("/upload-file", upload.single('file'), uploadController.uploadImage);

module.exports = router;
