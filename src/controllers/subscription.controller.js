import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { Subscription } from "../models/subscription.model.js";

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

export { toggelSubscription };
