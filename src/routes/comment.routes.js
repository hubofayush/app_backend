import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addComment,
    getAllCommentsOfVideo,
    updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/get-comments/:videoId").get(getAllCommentsOfVideo);
router.route("/add-comment/:videoId").post(addComment);
router.route("/update-comment/:commentId").patch(updateComment);
router.route("/delete-comment/:commentId").delete(updateComment);
export default router;
