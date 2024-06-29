import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Video } from "../models/video.model.js";
// for publish a video //
const publishAVideo = asyncHandler(async (req, res) => {
    // getting requiered fields //
    const { title, description } = req.body;
    if (!title || !description) {
        throw new ApiError(404, "title and description required");
    }
    // end of getting requiered fields //

    // getting videofile and thumbnail from multer//
    const videoFilePath = req.files?.videoFile[0]?.path;
    if (!videoFilePath) {
        throw new ApiError(404, "video file path is required");
    }

    const thumbnailPath = req.files?.thumbnail[0]?.path;
    if (!thumbnailPath) {
        throw new ApiError(404, "video file path is required");
    }
    // end of getting videofile and thumbnail //

    // upload video and thumbnail on cloudinary //
    const videoFile = await uploadOnCloudinary(videoFilePath);
    if (!videoFile) {
        throw new ApiError(400, "video not uploaded on cloudinary");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailPath);
    if (!thumbnail) {
        throw new ApiError(400, "thumbanail not uploaded on cloudinary");
    }
    // end of upload video and thumbnail on cloudinary //

    // file uplaod on db //
    const video = await Video.create({
        title: title,
        description: description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: req.user,
    });

    if (!video) {
        throw new ApiError(400, "Video not uploaded on db");
    }
    // file uplaod on db //

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                { video: video },
                "video uploaded successfully",
            ),
        );
});
// end of for publish a video //

export { publishAVideo };
