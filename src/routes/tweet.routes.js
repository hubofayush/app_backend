import Router from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addNewTweet, getUserTwwets } from "../controllers/tweet.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/post-tweet").post(addNewTweet);
router.route("/get-tweets/:userId").get(getUserTwwets);

export default router;