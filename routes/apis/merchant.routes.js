const express = require("express");
const router = express.Router();
const MerchantController = require("../../controllers/merchant.controller");
const { verifyToken } = require("../../middlewares/token");

// Register Merchant with mobile number
router.post("/send-otp", MerchantController.registerMerchantWithMobile);

// Verify OTP
router.post("/verify-otp", MerchantController.verifyOTP);

// Store Merchant details
router.get("/get-merchant", verifyToken, MerchantController.getMerchantDetails);
router.post("/register-merchant", verifyToken, MerchantController.registerMerchantDetails);

module.exports = router;
