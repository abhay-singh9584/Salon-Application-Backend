const mongoose = require("mongoose");
const { Schema } = mongoose;

// Users Collection
const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows documents without an email field
    },
    phone_number: {
      type: String,
      required: true, // Make phone_number required
      index: true, // Add an index for faster queries
    },
    passwordHash: {
      type: String,
    },
    role: {
      type: [String], // Array to allow "customer" and "merchant"
      enum: ["customer", "merchant"], // Only allow these values
      validate: {
        validator: function (roles) {
          return roles.length > 0 && roles.every(role => ["customer", "merchant"].includes(role));
        },
        message: "Role must be 'customer', 'merchant', or both.",
      },
      required: true,
    },
    is_customer : {
      type : Boolean,
      required : true,
      default : false
    },
    is_merchant: {
      type : Boolean,
      required : true,
      default : false
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false, // Disables __v field
  }
);

// Ensure at least one of email or phone is present
userSchema.pre("validate", function (next) {
  if (!this.email && !this.phone_number) {
    return next(new Error("Either email or phone must be provided"));
  }

  // If email exists, password is mandatory
  if (this.email && !this.passwordHash) {
    return next(new Error("Password is required when email is provided"));
  }

  next();
});

// Create a unique compound index on { phone_number, role }
userSchema.index({ phone_number: 1, role: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
