const mongoose = require("mongoose");
const { Schema } = mongoose;

// Merchants Collection
const merchantSchema = new Schema(
  {
     _id: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to User model
      required: true
    },
    phone_number: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    merchant_name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    location: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: "2dsphere", // Enables geospatial queries
    },
    email: {
      type: String,
      // unique: true,
      required: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false, // Removes __v field
  }
);

const Merchant = mongoose.model("Merchant", merchantSchema);
module.exports = Merchant;
