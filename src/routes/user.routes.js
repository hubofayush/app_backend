import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
const router = Router();

// impoting upload from multer
import { upload } from "../middlewares/multer.middleware.js";

router.route("/register").post(
    // middleware //
    upload.feilds([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),

    registerUser, // controller
);

export default router;
