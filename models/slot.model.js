// models/Slot.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const slotSchema = new Schema(
  {
    storeID: {
      type: Number,
      required: true,
    },
    startTime: {
      type: String, // Format: 'HH:mm'
      required: true,
    },
    endTime: {
      type: String, // Format: 'HH:mm'
      required: true,
    },
    date: {
      type: String, // Format: 'YYYY-MM-DD'
      required: true,
    },
    booking: {
      type: String,
      ref: 'Booking',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Unique index to prevent duplicate slots for the same store/time/date
slotSchema.index({ storeID: 1, date: 1, startTime: 1 });

module.exports = mongoose.model('Slot', slotSchema);
