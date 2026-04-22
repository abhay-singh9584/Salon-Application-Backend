const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ["percentage", "fixed"], required: true },
  discountValue: { type: Number, required: true },
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  maxUsage: { type: Number, default: 1 }, // total allowed uses
  usedCount: { type: Number, default: 0 }, // tracks usage
  applicableProducts: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  ], // optional
  minimumOrder: { type: Number }, // optional minimum order
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("Coupon", couponSchema);
