import Router from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getChannelSubscribers,
    getSubscribedChannel,
    toggelSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/toggle-subscription/:channelId").patch(toggelSubscription);

router.route("/get-subscribers/:channelId").get(getChannelSubscribers);

router.route("/get-subscribed/:subscriberId").get(getSubscribedChannel);
export default router;
