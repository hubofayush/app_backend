import Router from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addNewTweet } from "../controllers/tweet.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/post-tweet").post(addNewTweet);

export default router;
