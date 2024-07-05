import Router from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getAllLikedVideo,
    toggleLikeComment,
    toggleLikeTweet,
    toggleLikeVideo,
} from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/toggle-video/:videoId").post(toggleLikeVideo);
router.route("/toggle-comment/:commentId").post(toggleLikeComment);
router.route("/toggle-tweet/:tweetId").post(toggleLikeTweet);
router.route("/get-videos/:userId").get(getAllLikedVideo);

export default router;
