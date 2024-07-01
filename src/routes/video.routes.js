import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getAllVideos,
    getVideoById,
    publishAVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.use(verifyJWT);

// publish video route //
router.route("/publish-video").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    publishAVideo,
);
// end of publish video route //

// get video by id //
router.route("/v/:videoId").get(getVideoById);
// end of get video by id //

// get all videos //
router.route("/").get(getAllVideos);
// end of get all videos //
export default router;
