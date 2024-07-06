import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";

// toggle like on vide //
const toggleLikeVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(404, "video ID is required");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "in apropriate id");
    }

    let data = {
        likedBy: req.user?._id,
        video: videoId,
    };

    const like = await Like.find(data);

    if (like.length === 0) {
        const newLike = await Like.create({
            video: videoId,
            likedBy: req.user?._id,
        });
        // console.log(newLike);
        if (!newLike) {
            throw new ApiError(400, "cant liked on db");
        }

        return res
            .status(200)
            .json(new ApiResponce(200, newLike, "video liked"));
    } else {
        const deleteLike = await Like.findOneAndDelete(data);

        if (!deleteLike) {
            throw new ApiError(400, "cant delete liked on db");
        }

        return res
            .status(200)
            .json(new ApiResponce(200, deleteLike, "liked removed from video"));
    }
});
// end of toggle like on vide //

// toggle like on comment //
const toggleLikeComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(404, "video ID is required");
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(404, "in apropriate id");
    }

    let data = {
        likedBy: req.user?._id,
        comment: commentId,
    };

    const like = await Like.find(data);

    if (like.length === 0) {
        const newLike = await Like.create({
            comment: commentId,
            likedBy: req.user?._id,
        });
        console.log(newLike);
        if (!newLike) {
            throw new ApiError(400, "cant liked on db");
        }

        return res
            .status(200)
            .json(new ApiResponce(200, newLike, "comment liked"));
    } else {
        const deleteLike = await Like.findOneAndDelete(data);

        if (!deleteLike) {
            throw new ApiError(400, "cant delete liked on db");
        }

        return res
            .status(200)
            .json(
                new ApiResponce(200, deleteLike, "liked removed from comment"),
            );
    }
});
// end of toggle like on comment //
// toggle like on tweet //
const toggleLikeTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(404, "video ID is required");
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "in apropriate id");
    }

    let data = {
        likedBy: req.user?._id,
        tweet: tweetId,
    };

    const like = await Like.find(data);

    if (like.length === 0) {
        const newLike = await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id,
        });
        console.log(newLike);
        if (!newLike) {
            throw new ApiError(400, "cant liked on db");
        }

        return res
            .status(200)
            .json(new ApiResponce(200, newLike, "Tweet liked"));
    } else {
        const deleteLike = await Like.findOneAndDelete(data);

        if (!deleteLike) {
            throw new ApiError(400, "cant delete liked on db");
        }

        return res
            .status(200)
            .json(new ApiResponce(200, deleteLike, "liked removed from tweet"));
    }
});
// end of toggle like on tweet //

// get liked videos //
const getAllLikedVideo = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(404, "userId required");
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(404, "inapropriate id");
    }

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $exists: true, $ne: null },
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videos",
                pipeline: [
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
                            thumbnail: 1,
                            duration: 1,
                            title: 1,
                            owner: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                videos: {
                    $first: "$videos",
                },
            },
        },
        {
            $project: {
                videos: 1,
            },
        },
        {
            $sort: { createdAt: -1 },
        },
    ]);

    if (likedVideos.length === 0) {
        return res
            .status(200)
            .json(
                new ApiResponce(200, likedVideos, "user has no liked videos"),
            );
    }
    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                likedVideos,
                "liked videos fetched successfully",
            ),
        );
});
// end of get liked videos //

export {
    toggleLikeVideo,
    toggleLikeComment,
    toggleLikeTweet,
    getAllLikedVideo,
};
