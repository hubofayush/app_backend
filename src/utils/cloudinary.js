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

/**
 * Deletes an image from Cloudinary.
 * @param {string} imageUrl - The URL of the image to be deleted.
 * @returns {Promise} - A promise that resolves to the response from Cloudinary if the image is deleted successfully, or null if there is an error or the imageUrl is empty.
 */
const deleteImageOnCloudinary = async (imageUrl) => {
    try {
        // checking loacalpath //
        if (!imageUrl) {
            console.log("image url required");
            return null;
        }

        // getting file id //

        const parts = imageUrl.split("/");
        const idWithExtension = parts[parts.length - 1];
        const idWithoutExtension = idWithExtension.split(".");
        const publicId = idWithoutExtension[0];

        // console.log(publicId);
        // end of getting file id //

        // delete file on cloudinary //
        const responce = await cloudinary.uploader.destroy(publicId);
        if (!responce) {
            console.log("erorr on uploading");
        }

        return responce; // for user
        // end of delete file on cloudinary //
    } catch (error) {
        console.log("error on deleting image on cloudinary:", error);
        fs.unlinkSync(localFilePath);
        return null;
    }
};
export { uploadOnCloudinary, deleteImageOnCloudinary };
