const User   = require("../models/users.model");
const { generateToken } = require("../middlewares/token");
const MerchantService = require("../services/merchant.service");
const UserService = require("../services/user.service");
const { findMissingField } = require("../utils/utils");
const sendResponse = require("../utils/responseUtil");
const jwt = require("jsonwebtoken");
const config = require("../../config/config");


require("dotenv").config();

// Register customer & send OTP
const registerMerchantWithMobile = async (req, res) => {
    try {
        const { country_code, phone_number } = req.body;

        // Validate required fields
        if (!country_code || !phone_number) {
            return sendResponse(res, 400, "FAILED", "Missing required field");
        }

        const sentOtp = await MerchantService.registerMerchantWithMobile(country_code, phone_number);

        if (!sentOtp) {
            return sendResponse(res, 500, "FAILED", "Failed to send OTP. Please try again later.");
        }

        return sendResponse(res, 200, "SUCCESS", "OTP sent successfully");

    } catch (error) {
        console.error("Error in customer registration:", error);
        return sendResponse(res, 400, "FAILED", error.message);
    }
};

// Verify OTP
const verifyOTP = async (req, res) => {
    try {
        const { country_code, phone_number, otp } = req.body;

        // Validate required fields
        if (!country_code || !phone_number || !otp) {
            return sendResponse(res, 400, "FAILED", "Missing required field");
        }

        if (otp == config.byPass) {
          const fullPhoneNumber = `${country_code}${phone_number}`;
          const user = await UserService.findUserAsMerchant(fullPhoneNumber);
          let token;
          token = generateToken(user._id);
          return sendResponse(
            res,
            200,
            "SUCCESS",
            "OTP verified successfully",
            { token: token, is_customer_registered: user.is_customer }
          );
        }

        const verifyOtp = await MerchantService.verifyOTP(country_code, phone_number, otp);

        if (!verifyOtp) {
          return sendResponse(res, 400, "FAILED", "Invalid OTP");
        }

        const fullPhoneNumber = `${country_code}${phone_number}`;
        
        const user = await UserService.findUserAsMerchant(fullPhoneNumber);
        
        let token;
        console.log(user);
        if (user) {
            token = generateToken(user._id);
            return sendResponse(res, 200, "SUCCESS", "OTP verified successfully", { token:token });
        }else{
            
            const merchantCreated = await UserService.createUserAsMerchant(fullPhoneNumber);
            token = generateToken(merchantCreated._id);
  
              if (!merchantCreated) {
                  return sendResponse(res, 400, "FAILED", "Merchant creation failed");
              }

              return sendResponse(res, 200, "SUCCESS", "OTP verified successfully and merchant created successfully", { token:token });
          }
    } catch (error) {
        console.error("Error in OTP verification:", error);
        return sendResponse(res, 400, "FAILED", error.message);
    }
};

// Store Merchant details
const registerMerchantDetails = async (req, res) => {
    try {
        const { merchant_name, age, gender,email,country_code,phone_number, location } = req.body;

        const requiredFields = ["merchant_name", "age", "gender"];
        const missingField = findMissingField(requiredFields, req.body);

         if (missingField) {
           return sendResponse(res, 400, "FAILED", `Missing required field: ${missingField}`);
         }

         // Ensure at least one of email or phone_number is provided
         if (!email && !phone_number) {
           return sendResponse(res, 400, "FAILED", "Either email or phone_number is required");
         }

         // Validate age
         if (age < 0 || age > 100) {
           return sendResponse(res, 400, "FAILED", "Invalid Age");
         }

        // Validate gender
        if (!['male', 'female', 'other'].includes(gender.toLowerCase())) {
            return sendResponse(res, 400, "FAILED", "Invalid gender. Must be 'male', 'female', or 'other'");
        }

        const fullPhoneNumber = `${country_code}${phone_number}`;

        const user = await User.findOne({ phone_number: fullPhoneNumber });

        if (!user) {
            return sendResponse(res, 400, "FAILED", "User not found please register user first");
        }

        // Check if customer already exists
        const existingMerchant = await MerchantService.getMerchantDetails(user._id);

        if (existingMerchant) {
            return sendResponse(res, 400, "FAILED", "Merchant details alredy exits");
        }

        // Create new Merchant
        const merchant = await MerchantService.registerMerchantDetails(
            fullPhoneNumber,
            merchant_name,
            age,
            gender.toLowerCase(),
            location
        );
          
        if(!merchant){
            return sendResponse(res, 400, "FAILED", "Merchant registration failed");
        }

        return sendResponse(res, 201, "SUCCESS", "Merchant registered successfully", { merchant ,is_new_user : true});

    } catch (error) {
        console.error("Error registering merchant:", error);
        return sendResponse(res, 500, "FAILED", error.message);
    }
};

const getMerchantDetails = async (req, res) => {
    try {
        const token = req.header("Authorization");
        if (!token) {
            return sendResponse(res, 401, "FAILED", "Access denied. No token provided.");
        }
        
        let decodedUser;
        try {
            decodedUser = jwt.verify(token, config.JWT_SECRET);
        } catch (err) {
            return sendResponse(res, 403, "FAILED", "Invalid or expired token.");
        }
        
        // Check if merchant already exists
        const existingMerchant = await MerchantService.getMerchantDetails(decodedUser._id);

        if (!existingMerchant) {
            return sendResponse(res, 409, "FAILED", "Merchant with the phone number already exists");
        }

        return sendResponse(res, 200, "SUCCESS", "Merchant details fetched successfully", { existingMerchant });

    } catch (error) {
        console.error("Error fetching merchant details:", error);
        return sendResponse(res, 500, "FAILED", error.message);
    }
};

module.exports = {
    registerMerchantWithMobile : registerMerchantWithMobile,
    verifyOTP : verifyOTP,
    getMerchantDetails : getMerchantDetails,
    registerMerchantDetails : registerMerchantDetails,
};