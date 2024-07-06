import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    deleteVideo,
    getAllVideos,
    getChannelVideosId,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
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

// update video details //
router
    .route("/update-video/:videoId")
    .patch(upload.single("thumbnail"), updateVideo);
// end of update video details //

// delete video on cloudinary //
router.route("/delete-video/:videoId").delete(deleteVideo);
// end of delete video on cloudinary //

// toggle publish status //
router.route("/toggle-status/:videoId").patch(togglePublishStatus);
// end of toggle publish status //

// get channel videos //
router.route("/user-videos/:userId").get(getChannelVideosId);
//end of  get channel videos //

export default router;
