const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const logger = require("../helpers/logger");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = {
  uploadImage: async function (image) {
    try {
      const featureImagePath = await path.resolve(`./uploads/${image.name}`);
      await image.mv(featureImagePath);
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload(featureImagePath)
          .then((result) => {
            fs.unlinkSync(featureImagePath);
            resolve(result);
          })
          .catch((error) => {
            logger.error(error);
            reject(error);
          });
      });
    } catch (error) {
      logger.error(error);
    }
  },
};
