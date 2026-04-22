const AWS = require('aws-sdk');
const path = require('path');
const config = require("../../config/config");

// AWS config (use your credentials and region)
const s3 = new AWS.S3({
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    region: config.AWS_REGION
});

/**
 * Uploads a file to S3 in a folder named after storeId.
 * Filename format: storeId_timestamp.ext
 */
const uploadToS3 = async (fileBuffer, storeId, originalName, mimeType) => {
  const fileExtension = path.extname(originalName);
  const timestamp = Date.now();
  const fileName = `${storeId}_${timestamp}${fileExtension}`;
  const s3Key = `store_images/${storeId}/${fileName}`;

  const params = {
    Bucket: config.S3_BUCKET_NAME,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: 'public-read', // Optional: makes the image accessible via URL
  };

  const result = await s3.upload(params).promise();
  return result.Location; // Returns public URL
};

const uploadBannersToS3 = async (fileBuffer, originalName, mimeType) => {
  const fileExtension = path.extname(originalName);
  const timestamp = Date.now();
  const fileName = `${originalName}_${timestamp}${fileExtension}`;
  const s3Key = `banner_images/${fileName}`;

  const params = {
    Bucket: config.S3_BUCKET_NAME,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: 'public-read', // Optional: makes the image accessible via URL
  };

  const result = await s3.upload(params).promise();
  return result.Location; // Returns public URL
};

module.exports = {
  uploadToS3 : uploadToS3,
  uploadBannersToS3 : uploadBannersToS3
};
