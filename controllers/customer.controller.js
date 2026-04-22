
const { generateToken , verifyRefreshToken } = require("../middlewares/token");
const CustomerService = require("../services/customer.service");
const UserService = require("../services/user.service");
const { findMissingField } = require("../utils/utils");
const sendResponse = require("../utils/responseUtil");
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

require("dotenv").config();

// Register customer & send OTP
const registerCustomerWithMobile = async (req, res) => {
    try {
        const { country_code, phone_number } = req.body;

        // Validate required fields
        if (!country_code || !phone_number) {
          return sendResponse(res, 400, "FAILED", "Missing required field");
        }

        const sentOtp = await CustomerService.registerCustomerWithMobile(country_code, phone_number);
        
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
          const user = await UserService.findUserAsCustomer(fullPhoneNumber);
          if(!user) return sendResponse(res, 400, "FAILED", "Customer Not Found");
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
        
        const verifyOtp = await CustomerService.verifyOTP(country_code, phone_number, otp);
        
        if (!verifyOtp) {
          return sendResponse(res, 400, "FAILED", "Invalid OTP");
        }
        
        const fullPhoneNumber = `${country_code}${phone_number}`;
        
        const user = await UserService.findUserAsCustomer(fullPhoneNumber);
        
        let token;
        if (user) {
          token = generateToken(user._id);
          return sendResponse(res, 200, "SUCCESS", "OTP verified successfully", { token:token, is_customer_registered : user.is_customer });
        }else{
            const customerCreated = await UserService.createUserAsCustomer(fullPhoneNumber);

            token = generateToken(customerCreated._id);

            if (!customerCreated) {
                return sendResponse(res, 400, "FAILED", "Customer creation failed");
            }

            return sendResponse(res, 200, "SUCCESS", "OTP verified successfully and customer created successfully", { token:token , is_customer_registered : false });
        }
    } catch (error) {
        console.error("Error in OTP verification:", error);
        return sendResponse(res, 400, "FAILED", error.message);
    }
};

const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken)
        return res.status(400).json({ status: "FAILED", message: "No refresh token provided." });

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded)
        return res.status(403).json({ status: "FAILED", message: "Invalid or expired refresh token." });

    // (Optional) Check if refreshToken is still valid in DB
    const user = await UserService.findUserAsCustomerById(decoded._id);

    if (!user)
        return res.status(404).json({ status: "FAILED", message: "User not found." });

    // Issue new tokens
    const tokens = generateToken(user._id);
    res.status(200).json({ status: "SUCCESS", ...tokens });
}

// Store customer details
const registerCustomerDetails = async (req, res) => {
    try {
      const { customer_name, age, gender, email, country_code, phone_number } =
        req.body;

      const requiredFields = ["customer_name", "age", "gender"];

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
      if (!["male", "female", "other"].includes(gender.toLowerCase())) {
        return sendResponse(res, 400, "FAILED", "Invalid gender. Must be 'male', 'female', or 'other'");
      }

      const fullPhoneNumber = `${country_code}${phone_number}`;

      // Check if customer already exists
      const userDetails =  await UserService.findUserAsCustomer(fullPhoneNumber);

      if (userDetails.is_customer) {
        return sendResponse(res, 400, "FAILED", "Customer details alredy exits");
      }

      const createdCustomer = await CustomerService.registerCustomerDetails(
        fullPhoneNumber,
        customer_name,
        age,
        gender.toLowerCase(),
      );

      const isCustomerRegistered = await UserService.registerUserAsCustomer(fullPhoneNumber);

      if (!createdCustomer) {
        return sendResponse(res, 400, "FAILED", "Customer creation failed");
      }

      if (!isCustomerRegistered) {
        const deleteCustomerDetails =  await CustomerService.deleteCustomerDetails(createdCustomer._id);
        if(deleteCustomerDetails)
        return sendResponse(res, 400, "FAILED", "User registration failed");
      }

      return sendResponse(res, 201, "SUCCESS", "Customer registered successfully", { is_customer_registered : isCustomerRegistered.is_customer });
    } catch (error) {
        console.error("Error registering customer:", error);
        return sendResponse(res, 500, "FAILED", error.message);
    }
};

const getCustomerDetails = async (req, res) => {
    try {
        // 🔐 Decode token from Authorization header
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

        const existingCustomer = await CustomerService.getCustomerDetails(decodedUser._id);

        if (!existingCustomer) {
            return sendResponse(res, 409, "FAILED", "Customer with the phone number not exists");
        }

        return sendResponse(res, 200, "SUCCESS", "Customer details fetched successfully",  existingCustomer);

    } catch (error) {
        console.error("Error fetching customer details:", error);
        return sendResponse(res, 500, "FAILED", error.message);
    }
};

const addFavorite = async (req, res) => {
  try{
    const { store_id } =req.body;
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

    const customer = await CustomerService.addFavoriteStore(decodedUser._id, store_id)
    if(!customer){
      return sendResponse(res, 409, "FAILED", "Customer or Store not found");
    }
    return sendResponse(res, 200, "SUCCESS", "Favorite store added successfully", { customer });
  }
  catch(error){
    return sendResponse(res, 500, "FAILED", error.message);
  }
}

const getFavorite = async (req, res) => {
  try{
    // const { store_id } =req.body;
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

    console.log("first",decodedUser)

    const favStores = await CustomerService.getFavoriteStore(decodedUser._id)
    if(!favStores){
      return sendResponse(res, 409, "FAILED", "Customer or Store not found");
    }
    return sendResponse(res, 200, "SUCCESS", "Favorite fetched successfully", { favStores });
  }
  catch(error){
    return sendResponse(res, 500, "FAILED", error.message);
  }
}

const removeFavorite = async (req, res) => {
  try{
    const { store_id } =req.body;
    
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

    const customer = await CustomerService.removeFavoriteStore(decodedUser._id,store_id);
    if(!customer){
      return sendResponse(res, 409, "FAILED", "Customer or Store not found");
    }
    return sendResponse(res, 200, "SUCCESS", "Favorite store removed successfully", { customer });
  }
  catch(error){
    return sendResponse(res, 500, "FAILED", error.message);
  }

}

const upadateDetails = async (req,res)=>{
  try{
    const details = req.body;
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
    // console.log(details);
    const updatedCustomer = await CustomerService.updateCustomerDetails(decodedUser._id,details)

    if(!updatedCustomer){
      return sendResponse(res, 403, "FAILED", "Customer not found");
    }
    return sendResponse(res, 200, "SUCCESS", "Customer updated successfully", updatedCustomer );
  }catch(err){
    return sendResponse(res, 500, "FAILED", err);
  }
}

const deleteCustomer = async (req, res) => {
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

    const customerId = decodedUser._id; // from token

    const deletedCustomer = await CustomerService.deleteCustomer(customerId)

    if (!deletedCustomer) {
      return sendResponse(res, 404, "FAILED", "No Customer Found");
    }

    return sendResponse(
      res,
      200,
      "SUCCESS",
      "Customer deleted successfully",
      deletedCustomer
    );
  } catch (error) {
    console.error("Delete customer error:", error);
    sendResponse(res, 500, "FAILED", error.message);
  }
};


module.exports = {
    registerCustomerWithMobile : registerCustomerWithMobile,
    verifyOTP : verifyOTP,
    refreshToken : refreshToken,
    getCustomerDetails : getCustomerDetails,
    registerCustomerDetails : registerCustomerDetails,
    addFavorite : addFavorite,
    getFavorite : getFavorite,
    removeFavorite : removeFavorite,
    upadateDetails: upadateDetails,
    deleteCustomer: deleteCustomer
};
