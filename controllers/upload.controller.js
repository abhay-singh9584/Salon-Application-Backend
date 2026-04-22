const sendResponse = require("../utils/responseUtil");
const uploadUtil = require("../utils/s3Upload");

const uploadImage = async (req, res) => {
  try {
    const { store_id } = req.body;
    const file = req.file;

    if (!store_id || !file) {
      return res.status(400).json({ message: "store_id and file are required." });
    }

    const imageUrl = await uploadUtil.uploadToS3(
      file.buffer,
      store_id,
      file.originalname,
      file.mimetype
    );

    if (!imageUrl) {
        return sendResponse(res, 500, "FAILED", "Image upload failed, Failed to upload image to S3");
    }

    sendResponse(res, 200, "SUCCESS", "Image uploaded successfully", { imageUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    sendResponse(res, 500, "FAILED", error.message);
  }
};

module.exports = {
  uploadImage : uploadImage,
};
