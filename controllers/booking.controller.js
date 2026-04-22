const Booking = require('../models/booking.model');
const BookingService = require('../services/booking.service');
const SlotService = require('../services/slot.service');
const sendResponse = require('../utils/responseUtil');
const Customer  = require("../models/customer.model");
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const createBooking = async (req, res) => {
  try {
    const bookingData = req.body;
    const alreadyBooked = await Booking.findOne(bookingData)
    if(alreadyBooked){
      return sendResponse(res, 404, "FAILED", "Booking already exists")
    }

    const available_slot = await SlotService.createSlot(bookingData); 

    if(!available_slot){
      return sendResponse(res, 404, "UNAVAILABLE", "Slot is full")
    }
    const result = await BookingService.createBooking(bookingData,available_slot._id);

    if (result) {
      available_slot.booking = result.booking_id;
      await available_slot.save();
      return sendResponse(res, 201, "SUCCESS", "Booking created successfully", result);
    }
    return sendResponse(res, 400, "FAILED", "Booking creation failed");
  } catch (error) {
    return sendResponse(res, 500, "FAILED", error.message);
  }
};

const getBooking = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await BookingService.getBookingById(id);

    if (result) {
      return sendResponse(res, 200, "SUCCESS", "Booking details found", result);
    }
    return sendResponse(res, 404, "FAILED", "Booking not found");
  } catch (error) {
    return sendResponse(res, 500, "FAILED", error.message);
  }
};

const updateBooking = async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;
    const result = await BookingService.updateBooking(id, updateData);

    if (result) {
      return sendResponse(res, 200, "SUCCESS", "Booking updated", result);
    }
    return sendResponse(res, 404, "FAILED", "Booking not found");
  } catch (error) {
    return sendResponse(res, 500, "FAILED", error.message);
  }
};

const getAllBooking = async (req,res)=>{
  try{
    const token = req.header("Authorization");
    if (!token) {
        return sendResponse(res, 401, "FAILED", "Access denied. No token provided.");
    }
    
    let decodedUser;
    try {
        decodedUser = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
        return sendResponse(res, 403, "FAILED", "Invalid or expired token.");
    }
    const customer = await Customer.findOne({_id: decodedUser._id})
    const allBookings = await BookingService.getAllBookings(customer.phone_number)
    if(!allBookings){
      return sendResponse(res, 404, "FAILED", "Bookings not found");
    }
    return sendResponse(res, 200, "SUCCESS", "Bookings found successfully", allBookings);
  }catch(error){
    return sendResponse(res, 500, "FAILED", error.message);
  }
}

const addFavorite = async (req,res) =>{
  try{
    const { booking_id } = req.body; 

    const token = req.header("Authorization");
    if (!token) {
        return sendResponse(res, 401, "FAILED", "Access denied. No token provided.");
    }
    
    let decodedUser;
    try {
        decodedUser = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
        return sendResponse(res, 403, "FAILED", "Invalid or expired token.");
    }

    const customer = await Customer.findOne({_id: decodedUser._id})

    const customer_phone = customer.phone_number
    
    const booking = await Booking.findOneAndUpdate(
      { booking_id, customer_phone },
      { $set: { isFav: true } },
    );
    await booking.save();
    
    return sendResponse(res, 200, "SUCCESS", "Booking added to favorite")

  }catch(error){
    return sendResponse(res, 500, "FAILED", error.message);
  }
}

const getFavorites = async (req, res) =>{
  try{
    const token = req.header("Authorization");
    if (!token) {
        return sendResponse(res, 401, "FAILED", "Access denied. No token provided.");
    }
    
    let decodedUser;
    try {
        decodedUser = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
        return sendResponse(res, 403, "FAILED", "Invalid or expired token.");
    }

    const customer = await Customer.findOne({_id: decodedUser._id})

    const customer_phone = customer.phone_number;

    const favorites = await Booking.find({
      customer_phone,
      isFav: true,
      status: { $ne: 'cancelled' }
    }).sort({ created_at: -1 });

    return sendResponse(res, 200, "SUCCESS", "All favorite bookings", favorites)

    
  }catch(error){

    return sendResponse(res, 500, "FAILED", error.message);
  }
}

const removeFavorite = async (req, res) =>{
  try{
    const { booking_id } = req.body; 

    const token = req.header("Authorization");
    if (!token) {
        return sendResponse(res, 401, "FAILED", "Access denied. No token provided.");
    }
    
    let decodedUser;
    try {
        decodedUser = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
        return sendResponse(res, 403, "FAILED", "Invalid or expired token.");
    }

    const customer = await Customer.findOne({_id: decodedUser._id})

    const customer_phone = customer.phone_number
    
    const booking = await Booking.findOneAndUpdate(
      { booking_id, customer_phone },
      { $set: { isFav: false } },
    );
    await booking.save();
    
    return sendResponse(res, 200, "SUCCESS", "Booking removed from favorite")

    
  }catch(error){
    return sendResponse(res, 500, "FAILED", error.message);
  }
}

module.exports = {
  createBooking,
  getBooking,
  updateBooking,
  getAllBooking,
  addFavorite,
  getFavorites,
  removeFavorite
};
