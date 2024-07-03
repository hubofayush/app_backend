import Router from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getChannelSubscribers,
    toggelSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/toggle-subscription/:channelId").post(toggelSubscription);

router.route("/get-subscribers/:channelId").get(getChannelSubscribers);
export default router;
