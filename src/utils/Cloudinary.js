const cloudinary = require("cloudinary").v2;
const fs = require("fs");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadOnCloudinary = async (localpath) => {
  const options = {
    use_filename: true,
    unique_filename: true,
    overwrite: true,
  };

  try {
    if (!localpath) throw new Error("Local path is required");
    const result = await cloudinary.uploader.upload(localpath, options);
    fs.unlinkSync(localpath);
    const imageObj = { url: result.url, public_id: result.public_id };
    return imageObj;
  } catch (error) {
    fs.unlinkSync(localpath);
    console.log(error);
    return error;
  }
};

const deleteFromCloudinary = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
};
module.exports = { uploadOnCloudinary, deleteFromCloudinary };
