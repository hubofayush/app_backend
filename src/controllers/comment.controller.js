import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Comment } from "../models/comment.model.js";
import mongoose, { isValidObjectId, mongo } from "mongoose";

// to get all comments for video //
const getAllCommentsOfVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!videoId) {
        throw new ApiError(404, "video id is required");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "invalid id");
    }
    const parsedLimit = parseInt(limit);
    const skip = (page - 1) * parsedLimit;

    const comment = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
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
                            fullName: 1,
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
            $project: {
                content: 1,
                owner: 1,
                createdAt: 1,
            },
        },
        {
            $sort: { createdAt: -1 },
        },
        {
            $skip: skip,
        },
        {
            $limit: parsedLimit,
        },
    ]);

    if (comment.length === 0) {
        throw new ApiError(400, "cant get comments on db");
    }
    const totalComments = await Comment.countDocuments({ video: videoId });
    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                { comment, totalComments },
                "comments fetched successfully",
            ),
        );
});
// end of to get all comments for video //

// add a comment to a video //
const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { videoId } = req.params;
    if (!content) {
        throw new ApiError(404, "content is required");
    }
    if (!videoId) {
        throw new ApiError(404, "videoId is required");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "videoId is required");
    }

    const comment = await Comment.create({
        content: content,
        video: videoId,
        owner: req.user?._id,
    });

    if (!comment) {
        throw new ApiError(400, "comment not posted on db");
    }

    const updatedComment = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
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
                            fullName: 1,
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
            $project: {
                content: 1,
                owner: 1,
                createdAt: 1,
                totalComments: 1,
            },
        },
        {
            $sort: { createdAt: -1 },
        },
        {
            $skip: 0,
        },
        {
            $limit: 10,
        },
    ]);

    if (updatedComment.length === 0) {
        throw new ApiError(400, "cant fetched comments on db");
    }
    const totalComments = await Comment.countDocuments({ video: videoId });
    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                { updatedComment, totalComments },
                "comment added successfully",
            ),
        );
});
// end of add a comment to a video //

// update a comment //
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(404, "invalid commentid");
    }

    const findComment = await Comment.findById(commentId);

    if (!findComment) {
        throw new ApiError(404, "invalid id");
    }

    const { content = findComment.content } = req.body;
    if (!content) {
        throw new ApiError(404, "content cant be empty");
    }

    findComment.content = content;
    const updatedComment = await findComment.save({
        validateBeforeSave: false,
    });

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(findComment.video),
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
                            fullName: 1,
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
            $project: {
                content: 1,
                owner: 1,
                createdAt: 1,
                totalComments: 1,
            },
        },
        {
            $sort: { createdAt: -1 },
        },
        {
            $skip: 0,
        },
        {
            $limit: 10,
        },
    ]);

    if (comments.length === 0) {
        throw new ApiError(400, "cant fetched comments on db");
    }
    const totalComments = await Comment.countDocuments({
        video: findComment.video,
    });
    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                { comments, totalComments },
                "comment added successfully",
            ),
        );

    if (!updatedComment) {
        throw new ApiError(400, "cant update comment on db");
    }
});
// end of update a comment //

// delete a comment //
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(404, "invalid commentid");
    }

    const findComment = await Comment.findById(commentId);
    if (!findComment) {
        throw new ApiError(404, "cant find comment with this id");
    }
    const videoId = findComment.video;

    await Comment.findByIdAndDelete(commentId);

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
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
                            fullName: 1,
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
            $project: {
                content: 1,
                owner: 1,
                createdAt: 1,
                totalComments: 1,
            },
        },
        {
            $sort: { createdAt: -1 },
        },
        {
            $skip: 0,
        },
        {
            $limit: 10,
        },
    ]);

    if (comments.length === 0) {
        throw new ApiError(400, "cant fetched comments on db");
    }
    const totalComments = await Comment.countDocuments({
        video: videoId,
    });
    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                { comments, totalComments },
                "comment added successfully",
            ),
        );
});
// end of delete a comment //

export { getAllCommentsOfVideo, addComment, updateComment, deleteComment };
