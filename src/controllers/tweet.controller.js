import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose, { isValidObjectId } from "mongoose";
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
            $addFields: {
                owner: {
                    $first: "$owner",
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
// update Tweet //
// detele  Tweet //

export { addNewTweet };
