const express = require("express");
const router = express.Router();
const slotController = require("../../controllers/slot.controller")

router.get('/booked', slotController.getBookedSlot)

module.exports = router;