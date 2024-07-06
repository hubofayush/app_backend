import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";

import { Video } from "../models/video.model.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

// get channel stats //
const getChannelStats = asyncHandler(async (req, res) => {
    const stats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id),
            },
        },

        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "videoLikes",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $addFields: {
                totalLikes: {
                    $cond: {
                        if: {
                            $gt: [{ $size: "$videoLikes" }, 0],
                        },
                        then: { $size: "$videoLikes" },
                        else: 0,
                    },
                },
                totalSubscribers: {
                    $cond: {
                        if: {
                            $gt: [{ $size: "$subscribers" }, 0],
                        },
                        then: { $size: "$subscribers" },
                        else: 0,
                    },
                },
            },
        },
        {
            $group: {
              _id: "$owner",
              views: {
                $sum: "$views",
              },
              totalSubs: {
                $first: "$totalSubscribers",
              },
              totalLikes: {
                $first: "$totalLikes",
              },
            },
          },
          {
            $project: {
              _id:0,
              
            }
          }
    ]);

    if (stats.length === 0) {
        const noVideoStat = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user?._id),
                },
            },
            {
                $lookup: {
                    from: "subscription",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers",
                },
            },
            {
                $addFields: {
                    totalSubscribers: {
                        $size: "$subscribers",
                    },
                    totalLikes: 0,
                    totalViews: 0,
                },
            },
            {
                $project: {
                    id: 0,
                    totalSubscribers: 1,
                    totalLikes: 1,
                    totalViews: 0,
                    totalVideos: 0,
                },
            },
        ]);

        return res
            .status(200)
            .json(
                new ApiResponce(200, noVideoStat, "stats fetched successfully"),
            );
    }
    const totalVideos = await Video.countDocuments({ owner: req.user?._id });
    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                { ...stats[0], totalVideos },
                "stats fetched successfully",
            ),
        );
});
// end of get channel stats //

// get videos uploaded by channel //
const getChannelVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({
        owner: req.user?._id,
    });
    if (videos.length === 0) {
        throw new ApiError(400, "cant get all videos");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, videos, "videos fetched successfully"));
});
// get videos uploaded by channel //

export { getChannelStats, getChannelVideos };
