const twilio = require("twilio");
const config = require("../../config/config");
const Store = require("../models/stores.model");
const Booking = require("../models/booking.model");


// Generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000);


// Function to send OTP via Twilio
const sendOTP = async (phone_number, otp) => {
    try {
        const client = twilio(
            config.TWILIO_ACCOUNT_SID,
            config.TWILIO_AUTH_TOKEN
        );

        const message = await client.messages.create({
            body: `Your OTP for Salon is: ${otp}. Valid for 5 minutes.`,
            to: phone_number,
            from: config.TWILIO_PHONE_NUMBER,
        });

        console.log("OTP sent successfully:", message.sid);
        return true;
    } catch (error) {
        console.error("Error sending OTP:", error);
        return false;
    }
};

const findMissingField = (fields, data) => {
  for (const field of fields) {
    if (!data[field]) {
      return field; // Return the first missing field
    }
  }
  return null; // All required fields are present
};

const parseTime = (date, time) => new Date(`${date}T${time}:00`);

const isOverlapping = (startA, endA, startB, endB) => {
  return startA < endB && startB < endA;
};

const isSlotAvailable = async(storeId, date, startTime, endTime) =>{
  const store = await Store.findOne({store_id : storeId});
  // console.log("hello");
  if (!store) throw new Error('Store not found');
  // console.log("slots");
  const newStart = parseTime(date, startTime);
  const newEnd = parseTime(date, endTime);
  const storeCapacity =  store.total_slots;

  // Get all active bookings for that date and store
  const bookings = await Booking.find({
    store: storeId,
    status: { $ne: 'cancelled' },
  }).populate('slot');

  let overlapCount = 0;

  for (const booking of bookings) {
    const slot = booking.slot;
    if (!slot) continue;

    const bStart = parseTime(slot.date, slot.startTime);
    const bEnd = parseTime(slot.date, slot.endTime);

    if (isOverlapping(newStart, newEnd, bStart, bEnd)) {
      overlapCount++;
      if (overlapCount >= storeCapacity) return false;
    }
  }

  return true;
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  // console.log(lat1, lon1, lat2, lon2);
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance; // in km
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}


module.exports = { generateOTP, sendOTP, findMissingField, isSlotAvailable, getDistanceFromLatLonInKm };