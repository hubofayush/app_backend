import Router from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addNewTweet,
    deleteTweet,
    getUserTwwets,
    updateTweet,
} from "../controllers/tweet.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/post-tweet").post(addNewTweet);
router.route("/get-tweets/:userId").get(getUserTwwets);
router.route("/update-tweet/:tweetId").patch(updateTweet);
router.route("/delete-tweet/:tweetId").delete(deleteTweet);

export default router;
