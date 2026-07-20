const multer = require("multer");
const cloudinary = require("../config/cloudinaryConfig");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Inventoryfolder", // the folder name in your cloudinary account where the images will be stored
    allowedFormats: ["jpg", "jpeg", "png"], // allowed image formats
  }
});

const upload = multer({ storage: storage });
module.exports = upload;
