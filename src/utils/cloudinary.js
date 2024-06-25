import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({
    path: "./.env",
});
// console.log(
//     process.env.CLOUDINARY_API_KEY,
//     process.env.CLOUDINARY_CLOUD_NAME,
//     process.env.CLOUDINARY_API_SECRET,
// );

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // ** upload file on cloudinary
        const responce = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        //file has been uploaded successfully
        // console.log("file uploaded on cloudinary", responce.url);
        //
        fs.unlinkSync(localFilePath); // unlik file path
        return responce; // for user
    } catch (error) {
        console.log("error on cloudinary uploading :", error);
        fs.unlinkSync(localFilePath); // will remove local saved file if upload file failed
        return null;
    }
};

export { uploadOnCloudinary };
