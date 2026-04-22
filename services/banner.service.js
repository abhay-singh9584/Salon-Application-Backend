const sendResponse = require("../utils/responseUtil");
const uploadToS3 = require("../utils/s3Upload");

const uploadBannerImage = async (file) => {
  try {
    if (!file) {
      return res.status(400).json({ message: "store_id and file are required." });
    }

    const imageUrl = await uploadToS3.uploadBannersToS3(
      file.buffer,
      file.originalname,
      file.mimetype
    );

    if (!imageUrl) {
        return sendResponse(res, 500, "FAILED", "Image upload failed, Failed to upload image to S3");
    }

    return imageUrl;
  } catch (error) {
    console.error("Upload Error:", error);
    sendResponse(res, 500, "FAILED", error.message);
  }
};

module.exports = {
  uploadBannerImage : uploadBannerImage
};
