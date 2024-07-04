import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addComment,
    getAllCommentsOfVideo,
} from "../controllers/comment.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/get-comments/:videoId").get(getAllCommentsOfVideo);
router.route("/add-comment/:videoId").post(addComment);

export default router;
