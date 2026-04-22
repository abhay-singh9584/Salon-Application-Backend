const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true }, // in minutes
    category_id: { type: Number },
    category: { type: String, required: true }, // e.g., Haircut, Facial
    description: { type: String },
    image: { type: String } // URL to service image
});

const CatalogSchema = new mongoose.Schema({
    store_id: { type: Number, required: true, unique: true }, // Store ID as Integer
    services: [ServiceSchema]
}, { timestamps: true });

module.exports = mongoose.model('Catalog', CatalogSchema);
