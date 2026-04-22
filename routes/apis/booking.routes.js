const express = require('express');
const router = express.Router();
const BookingController = require('../../controllers/booking.controller');
const { verifyToken } = require('../../middlewares/token');

//Favorite
router.post('/add-fav-booking', verifyToken, BookingController.addFavorite)
router.get('/get-fav-bookings', verifyToken, BookingController.getFavorites)
router.delete('/remove-fav-booking',verifyToken, BookingController.removeFavorite)

router.get("/get-all-bookings", verifyToken, BookingController.getAllBooking)
router.get('/:id', BookingController.getBooking);
router.post('/create', BookingController.createBooking);
router.put('/:id', BookingController.updateBooking);



module.exports = router;
