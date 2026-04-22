const mongoose = require('mongoose');
const { Schema } = mongoose;

const customerSchema = new Schema(
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
    customer_name: {
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
    favorites: [
      {
        type: Number,
        ref: 'Store'
      }
    ],
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, // Renaming fields to snake_case
    versionKey: false, // Disables __v field
  }
);

// ✅ Allow same phone number again after delete
customerSchema.index(
  { phone_number: 1 },
  { unique: true, partialFilterExpression: { is_deleted: false } }
);

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
