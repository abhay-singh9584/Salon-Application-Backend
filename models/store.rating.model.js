const mongoose = require('mongoose');
const { Schema } = mongoose;

const StoreRatingSchema = new Schema(
  {
    store_id: { type: Number, required: true, index: true }, // links to Store.store_id
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, trim: true }, // optional customer review
    created_at: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

// Prevent the same customer from rating the same store multiple times
StoreRatingSchema.index({ store_id: 1, customer_id: 1 }, { unique: true });

const StoreRating = mongoose.model('StoreRating', StoreRatingSchema);
module.exports = StoreRating;