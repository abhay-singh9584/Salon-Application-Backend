const express = require('express');
const Banner = require('../models/banners.model'); // Import your Banner schema
const bannerService = require('../services/banner.service');
const sendResponse = require("../utils/responseUtil");

const getBanners = async (req, res) => {
  try {
   // Fetch all banners
    const banners = await Banner.find();

     if (!banners || banners.length === 0) {
       return res.status(404).json({ message: "No banners found" });
     }

     sendResponse(res, 200, "SUCCESS", "Banner details fetched successfully", {
       banners,
     });
  } catch (error) {
    console.error("Error retrieving banners details:", error);
    sendResponse(res, 500, "FAILED", error.message);
  }
}

// Assume uploadToS3(file) returns s3Url asynchronously
const uploadBanners = async (req, res) => {
  try {
    // 1. Get the image file and other data from request
    const { title, link, isActive } = req.body;
    const imageFile = req.file; // If using multer for file uploads

    // 2. Upload file to S3 and get URL
    const s3Url = await bannerService.uploadBannerImage(imageFile);

    // 3. Create banner entry in MongoDB
    const banner = new Banner({
      title,
      imageUrl: s3Url,
      link,
      isActive,
      createdAt: new Date()
    });

    await banner.save();

    sendResponse(res, 200, "SUCCESS", "Banner image uploaded successfully");
  } catch (err) {
    res.status(500).json({ message: 'Error adding banner', error: err.message });
  }
}

module.exports = {
    getBanners : getBanners,
    uploadBanners : uploadBanners
};
