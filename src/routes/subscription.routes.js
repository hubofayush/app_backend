import Router from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggelSubscription } from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/toggle-subscription/:channelId").post(toggelSubscription);

export default router;
