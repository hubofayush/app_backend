import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    deleteImageOnCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Video } from "../models/video.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";

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
        publicId: videoFile.public_id,
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

// get video by id //
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(404, "Video Id is required");
    }

    if (isValidObjectId(videoId) == false) {
        throw new ApiError(404, "invalid objetc id");
    }

    const updateViews = await Video.findById(videoId);
    if (!updateViews) {
        throw new ApiError(404, "invalid id");
    }

    if (!req.user?._id.equals(updateViews.owner._id)) {
        updateViews.views = updateViews.views + 1;
        await updateViews.save({ validateBeforeSave: false });
    }

    // finding video //
    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        // finding user or channel subscribers
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers",
                        },
                    },
                    {
                        // adding feilds
                        $addFields: {
                            // to count subscribers //
                            subscribersCount: {
                                $size: "$subscribers",
                            },
                        },
                    },
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            subscribersCount: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
            },
        },
    ]);
    // const video = await Video.findById(videoId);

    if (video.length === 0) {
        throw new ApiError(400, "invalid video id");
    }
    // end of finding video //

    // updating users wathc history //
    const user = await User.findById(req.user?._id);

    user.warchHistory.push(updateViews._id);
    await user.save({ validateBeforeSave: false });
    // end of updating users wathc history //

    return res
        .status(200)
        .json(new ApiResponce(200, video[0], "Video fetched successfully"));
});
// get video by id //

// get all videos //
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 2, sortBy, sortType } = req.query;

    const parsedLimit = parseInt(limit);
    const pageSkip = (page - 1) * parsedLimit;
    const sortStage = {};
    sortStage[sortBy] = sortType === "asc" ? 1 : -1;

    const video = await Video.aggregate([
        {
            $match: {
                isPublished: true,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
            },
        },
        {
            $sort: sortStage,
        },
        {
            $skip: pageSkip,
        },
        {
            $limit: parsedLimit,
        },
    ]);
    // console.log(video);
    if (!video) {
        throw new ApiError(400, "cannot get all vieos");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, video, "videos fetched successfully"));
});
// end of get all videos //

// update video details //
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(404, "videoId cant be empty");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "cant find video with this id");
    }

    // let id = video.owner;
    if (!video.owner.equals(req.user?._id)) {
        throw new ApiError(405, "video owner and user not matched");
    }

    const { title, description } = req.body;
    if (!(title || description)) {
        throw new ApiError(404, "feild not empty");
    }

    const thumbnailPath = req.file?.path;
    if (!thumbnailPath) {
        thumbnailPath = video.thumbnail;
    }

    const thumbnail = await uploadOnCloudinary(thumbnailPath);
    if (!thumbnail) {
        throw new ApiError(400, "thumbnail not upload on cloudinary");
    }

    const deleteOldThumbnail = await deleteImageOnCloudinary(video.thumbnail);

    const updateVideoDetails = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title || video.title,
                thumbnail: thumbnail.url,
                description: description || video.description,
            },
        },
        {
            new: true,
        },
    );
    if (!updateVideoDetails) {
        throw new ApiError(400, "video details not updated at db");
    }
    return res
        .status(200)
        .json(
            new ApiResponce(200, updateVideoDetails, "video details updated"),
        );
});
// end of update video details //

// delete video //
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(404, "Video id required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "invalid video id");
    }

    if (!video.owner.equals(req.user?._id)) {
        throw new ApiError(404, "user and owner not mathced");
    }

    // deleting video and image on cloudinary //
    const deleteVideoFile = await deleteImageOnCloudinary(video.videoFile);
    if (!deleteVideoFile) {
        throw new ApiError(404, "video not deleted on cloudinary");
    }
    const deleteThumbnailFile = await deleteImageOnCloudinary(video.thumbnail);
    if (!deleteThumbnailFile) {
        throw new ApiError(404, "thumbnail not deleted on cloudinary");
    }
    // end of deleting video and image on cloudinary //

    const deletedVideo = await Video.findByIdAndDelete(videoId);
    if (!deletedVideo) {
        throw new ApiError(400, "video not deled on db");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, deletedVideo, "video deleted successfully"));
});

// delete video //

// toggel pubish status //
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(404, "videoId needed");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "invalid video id");
    }

    if (!video.owner.equals(req.user?._id)) {
        throw new ApiError(405, "Video id and user id not matched");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished,
            },
        },
        {
            new: true,
        },
    );

    if (!updatedVideo) {
        throw new ApiError(400, "cant update isPublish status on db");
    }
    console.log(updatedVideo);
    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                updatedVideo,
                "video pusblish status updated successfullly",
            ),
        );
});
// end of toggel pubish status //

export {
    publishAVideo,
    getVideoById,
    getAllVideos,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
