const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    phone_number: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    expires_at: { type: Date, required: true, index: { expires: 300 } } // TTL Index
  },
  { versionKey: false }
);

// Ensure TTL index is created
// otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 300 });

module.exports = mongoose.model("OTP", otpSchema);
