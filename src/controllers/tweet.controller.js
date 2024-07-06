import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose, { isValidObjectId, set } from "mongoose";
import { Tweet } from "../models/tweet.model.js";

// add new Tweet //
const addNewTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
        throw new ApiError(404, "content is required");
    }

    const tweet = await Tweet.create({
        content: content,
        owner: req.user?._id,
    });

    if (!tweet) {
        throw new ApiError(400, "cant tweet on db");
    }

    const updatedTweet = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id),
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
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes",
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
                likes: {
                    $size: "$likes",
                },
            },
        },
        {
            $sort: { createdAt: -1 },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponce(200, updatedTweet, "tweet uploaded successfully"),
        );
});
// end of add new Tweet //

// get user tweets //
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(404, "userId is required");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(404, "inapropior id");
    }
    const tweet = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
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
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes",
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
                likes: {
                    $size: "$likes",
                },
            },
        },
        {
            $sort: { createdAt: -1 },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponce(200, tweet, "tweet fetched successfully"));
});
// end of get user tweets //

// update Tweet //
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!tweetId) {
        throw new ApiError(404, "tweet id required");
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "inapropior id");
    }

    const findTweet = await Tweet.findById(tweetId);
    if (!findTweet) {
        throw new ApiError(404, "invalid id");
    }

    if (!findTweet.owner.equals(req.user?._id)) {
        throw new ApiError(404, "user id and tweet id not matched");
    }

    const { content = findTweet.content } = req.body;

    if (!content) {
        throw new ApiError(404, "content is requied");
    }

    findTweet.content = content;
    await findTweet.save({ validateBeforeSave: false });

    const tweet = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id),
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
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes",
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
                likes: {
                    $size: "$likes",
                },
            },
        },
        {
            $sort: { createdAt: -1 },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponce(200, tweet, "tweet updated successfully"));
});
// end of update Tweet //

// detele  Tweet //
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(404, "tweet id is required");
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "inapropriate id");
    }

    let findTweet = await Tweet.findById(tweetId);
    if (!req.user?._id.equals(findTweet.owner)) {
        throw new ApiError(404, "user id and tweet id not matched");
    }

    const deleteTweet = await Tweet.findByIdAndDelete(tweetId);
    if (!deleteTweet) {
        throw new ApiError(404, "invalid id");
    }

    const tweet = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id),
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
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes",
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
                likes: {
                    $size: "$likes",
                },
            },
        },
        {
            $sort: { createdAt: -1 },
        },
    ]);

    return res
        .status(200)
        .json(new ApiResponce(200, tweet, "tweet fetched successfully"));
});
// end of detele  Tweet //

export { addNewTweet, getUserTweets, updateTweet, deleteTweet };
