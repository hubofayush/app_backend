import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";

// toggle subscription //
const toggelSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(404, "channel id required");
    }

    let data = {
        subscriber: req.user?._id,
        channel: channelId,
    };

    const sucbscribed = await Subscription.findOne(data);

    if (!sucbscribed) {
        const subscribe = await Subscription.create(data);
        if (!subscribe) {
            throw new ApiError(400, "subscribe not update at db");
        }

        return res
            .status(200)
            .json(new ApiResponce(200, subscribe, "subscribed"));
    } else {
        const unsubscribe = await Subscription.deleteOne(data);
        if (!unsubscribe) {
            throw new ApiError(400, "cant delete subscribe on db");
        }
        return res
            .status(200)
            .json(
                new ApiResponce(200, unsubscribe, "unsubscribed successfully"),
            );
    }
});
// end of toggle subscription //

// get subscrbers list of channel//
const getChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(404, "channel id required");
    }

    const channelSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers",
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
                subscribers: {
                    $first: "$subscribers",
                },
            },
        },
        {
            $project: {
                username: 1,
                subscribers: 1,
            },
        },
    ]);

    if (channelSubscribers.length === 0) {
        throw new ApiError(400, "invalid id");
    }

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                channelSubscribers,
                "subscribers fetched successfully",
            ),
        );
});
// end of get subscrbers list of channel//

// get subscriber subscribed to //
const getSubscribedChannel = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!subscriberId) {
        throw new ApiError(404, "id is required");
    }

    const getSubscribedTo = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedTo",
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
            $project: {
                subscribedTo: 1,
                // subscribedToCount: 1,
            },
        },
    ]);

    if (getSubscribedTo.length === 0) {
        throw new ApiError(404, "invalid id");
    }

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                getSubscribedTo,
                "subscribers of user fetched",
            ),
        );
});
// end of get subscriber subscribed to //

export { toggelSubscription, getChannelSubscribers, getSubscribedChannel };
