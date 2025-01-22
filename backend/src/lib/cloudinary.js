import { v2 as cloudinary } from "cloudinary";

import { config } from "dotenv";

config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:true
});

// Upload to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
      if (!localFilePath) return null
      //upload the file on cloudinary
      const response = await cloudinary.uploader.upload(localFilePath,{
          resource_type: "auto"
      })
      console.log(response.public_id)
      console.log("file is uploaded on cloudinary ", response.url);
      // fs.unlinkSync(localFilePath)
      return response;

  } catch (error) {
      console.error("Error uploading file to cloudinary: ", error.message);
      console.error('Error details:', error.response.data);
      fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
      return null;
  }
}

// Export the functions`
export default uploadOnCloudinary;



