const Booking = require('../models/booking.model');

const createBooking = async (data, available_slot) => {
  const newBooking = new Booking(data);
  newBooking.slot = available_slot;
  return await newBooking.save();
};

const getBookingById = async (id) => {
  return await Booking.findById({_id : id});
};

const updateBooking = async (id, data) => {
  return await Booking.findByIdAndUpdate(id, data, { new: true });
};

const getAllBookings = async (phone_number) =>{
  const bookings = await Booking.find({customer_phone: phone_number})
  if(bookings){
    return bookings
  }
  return null;
}

module.exports = {
  createBooking,
  getBookingById,
  updateBooking,
  getAllBookings
};
