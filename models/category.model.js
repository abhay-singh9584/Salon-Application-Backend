// models/Category.js

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  parent_id: {
    type: Number,
    required: true,
    default: -1 // -1 means it's a parent category
  }
}, {
  timestamps: true,
  versionKey: false 
});

module.exports = mongoose.model('Category', categorySchema);
