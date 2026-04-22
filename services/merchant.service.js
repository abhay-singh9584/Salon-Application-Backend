const Merchant  = require("../models/merchant.model");
const User   = require("../models/users.model");
const OTP = require("../models/otp.model");
const { generateOTP, sendOTP } = require("../utils/utils");
const userService = require("./user.service");

const registerMerchantWithMobile = async (country_code, phone_number) => {
    try {
        const fullPhoneNumber = `${country_code}${phone_number}`;
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        // Save OTP to MongoDB (Upsert: replace if already exists)
        await OTP.findOneAndUpdate(
            { phone_number: fullPhoneNumber },
            { otp, expires_at: expiresAt },
            { upsert: true, new: true }
        );

        // Try to send OTP
        const otpSent = await sendOTP(fullPhoneNumber, otp);
        
        if (!otpSent) {
            await OTP.deleteOne({ phone_number: fullPhoneNumber }); // Remove OTP if sending fails
            return false;
        }

        return true;
        
    } catch (error) {
        return false;
    }
}

const verifyOTP = async (country_code, phone_number, otp) => {
    try {
        const fullPhoneNumber = `${country_code}${phone_number}`;

        // Find OTP in MongoDB
        const storedOTP = await OTP.findOne({ phone_number: fullPhoneNumber });

        if (!storedOTP) {
            return false;
        }

        // Check if OTP is expired
        if (Date.now() > storedOTP.expires_at) {
            await OTP.deleteOne({ phone_number: fullPhoneNumber });
            return false;
        }   

        // Compare OTP
        if (storedOTP.otp != otp) {
            return false;
        }

        await OTP.deleteOne({ phone_number: fullPhoneNumber });

        return true;
    } catch (error) {
        return false;
    }
}

const findOrCreateMerchant = async (fullPhoneNumber) => {
    try {
        const merchant = await Merchant.findOne({ phone_number: fullPhoneNumber });
        if (merchant) return merchant;
        
        const newMerchant = new Merchant({ phone_number: fullPhoneNumber });
        return await newMerchant.save();
    } catch (error) {
        return null;
    }
}

const getMerchantDetails = async (user_id) => {
    try {
        const merchant = await Merchant.findOne({ _id: user_id })
            .select("-created_at -updated_at")
            .lean();

        return merchant || null;
    } catch (error) {
        return null;
    }
};

const registerMerchantDetails = async (fullPhoneNumber, merchant_name, age, gender, location) => {
    try {
        const userDetails = await User.findOne({phone_number : fullPhoneNumber});
        const merchant = new Merchant({
            _id : userDetails._id,
            phone_number: fullPhoneNumber,
            merchant_name,
            age,
            gender,
            location,
        });

        const savedMerchant = await merchant.save();

        // Convert to plain object and exclude fields
        return savedMerchant.toObject({ versionKey: false, transform: (doc, ret) => {
            delete ret._id;
            delete ret.created_at;
            delete ret.updated_at;
        }});
    } catch (error) {
        return null;
    }
}

module.exports = {
    registerMerchantWithMobile : registerMerchantWithMobile,
    verifyOTP : verifyOTP,
    findOrCreateMerchant : findOrCreateMerchant,
    getMerchantDetails : getMerchantDetails,
    registerMerchantDetails : registerMerchantDetails
}