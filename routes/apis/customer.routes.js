const express = require("express");
const router = express.Router();
const CustomerController = require("../../controllers/customer.controller");
const { verifyToken } = require("../../middlewares/token");

// Register customer with mobile number
router.post("/send-otp", CustomerController.registerCustomerWithMobile);

// Verify OTP
router.post("/verify-otp", CustomerController.verifyOTP);
router.post("/refresh-token", CustomerController.refreshToken);

// Store customer details
router.get("/get-customer", verifyToken, CustomerController.getCustomerDetails);
router.post("/register-customer", verifyToken, CustomerController.registerCustomerDetails);
router.put("/update-customer", verifyToken, CustomerController.upadateDetails);
router.delete("/delete-customer", verifyToken, CustomerController.deleteCustomer);

//Favorites
router.post("/add-favorite", verifyToken, CustomerController.addFavorite)
router.get("/get-favorites", verifyToken, CustomerController.getFavorite)
router.delete("/remove-favorites",CustomerController.removeFavorite)

module.exports = router;
