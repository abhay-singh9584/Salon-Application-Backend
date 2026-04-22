const mongoose = require('mongoose');
const { Schema } = mongoose;

// Stores Collection
const storeSchema = new Schema(
    {
        store_id: { type: Number, unique: true, index: true }, // Auto-incrementing storeId
        store_name: { type: String, required: true, trim: true },
        store_type : {type : String , required : true, index : true},
        primary_services: {type : String , required : true, index : true},
        phone_number: { type: String, required: true, unique: false, index: false },
        store_phone_number: { type: String, required: false, unique: false, index: false },
        address: { type: String, required: true, trim: true },
        image_url: { type: String, required: true, trim: true },
        map_url: { type: String, required: true, trim: true },
        location: { type: { type: String, enum: ['Point'], required: true, default: 'Point' }, coordinates: { type: [Number], required: true } },
        website_url: { type: String, required: true, trim: true },
        merchant_name: { type: String, required: true, trim: true },
        merchant_email: { type: String, required: true, unique: true },
        total_slots: { type: Number, default: 0 },
        facebook_url: { type: String, required: false, unique: false, index: false },
        instagram_url: { type: String, required: false, unique: false, index: false },
        twitter_url: { type: String, required: false, unique: false, index: false },
        rating: { average: { type: Number, default: 0 },count: { type: Number, default: 0 } },
        verified: { type: Boolean, default: false }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        versionKey: false
    }
);


// ➕ Create 2dsphere index for geospatial queries
storeSchema.index({ location: '2dsphere' });

// Pre-save hook to auto-increment storeId
storeSchema.pre('save', async function (next) {
    if (!this.store_id) {
        const lastStore = await mongoose.model('Store').findOne().sort({ store_id: -1 });
        this.store_id = lastStore ? lastStore.store_id + 1 : 10000;
    }
    next();
});

const Store = mongoose.model('Store', storeSchema);
module.exports = Store;
