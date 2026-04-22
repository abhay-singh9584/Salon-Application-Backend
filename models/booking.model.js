const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    booking_id: {
      type: Number,
      unique: true,
      required: false,
      index: true
    },
    customer_phone: {
      type: String,
      required: false,
    },
    booking_phone: {
      type: String,
      required: false,
    },
    booking_name: {
      type: String,
      required: false,
      trim: true,
    },
    customer_name: {
      type: String,
      required: false,
      trim: true,
    },
    store_id: {
      type: Number,
      required: false,
    },
    services: {
      type: Schema.Types.ObjectId,
      ref: 'Catalog',
      required: true,
    },
    date: {
      type: String, // e.g., '2025-06-28'
      required: true,
    },
    slot: {
      type: Schema.Types.ObjectId,
      ref: 'Slot',
      required: true,
    },
    timing: {
      type: String, // e.g., '10:00-10:30', '15:30-16:00'
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    isFav: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  }
);

// Auto-increment booking_id before save
bookingSchema.pre('save', async function (next) {
  // Only auto-increment if booking is new and booking_id is not already set
  if (this.isNew && !this.booking_id) {
    try {
      const lastBooking = await mongoose
        .model('Booking')
        .findOne()
        .sort({ booking_id: -1 })
        .select('booking_id'); // Limit fields for performance

      this.booking_id = lastBooking ? lastBooking.booking_id + 1 : 1;
      next();
    } catch (err) {
      return next(err); // Pass error to Mongoose
    }
  } else {
    next();
  }
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
