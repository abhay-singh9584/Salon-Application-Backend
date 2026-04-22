const express = require('express');
const router = express.Router();

// Import all route files
const customerRoutes = require('./apis/customer.routes');
const merchantRoutes = require('./apis/merchant.routes');
const catalogRoutes = require('./apis/catalog.routes');
const categoryRoutes = require('./apis/category.routes');
const uploadRoutes = require('./apis/upload.routes');
const storeRoutes = require('./apis/stores.routes');
const bookingRoutes = require('./apis/booking.routes');
const bannerRoutes = require('./apis/banners.routes');
const slotRoutes = require('./apis/slot.routes')

// Use routes
router.use('/api/customers', customerRoutes);
router.use('/api/merchants', merchantRoutes);
router.use('/api/stores', storeRoutes);
router.use('/api/catalog', catalogRoutes);
router.use('/api/category', categoryRoutes);
router.use('/api/upload', uploadRoutes);
router.use('/api/booking', bookingRoutes);
router.use('/api/banners', bannerRoutes);
router.use('/api/slot', slotRoutes)

module.exports = router;
