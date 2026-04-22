const express = require("express");
const router = express.Router();
const BannersController = require("../../controllers/banners.controller");
const { verifyToken } = require("../../middlewares/token");
const upload = require("../../middlewares/multer");

router.get("/all",  BannersController.getBanners);
router.post("/add", upload.single('image'),  BannersController.uploadBanners);

module.exports = router;
