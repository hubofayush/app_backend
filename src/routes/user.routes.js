import { Router } from "express";
import {
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAvatar,
    updateCoverImage,
} from "../controllers/user.controller.js";
const router = Router();

// impoting upload from multer
import { upload } from "../middlewares/multer.middleware.js";

// importing verifyJwt from auth middlware
import { verifyJWT } from "../middlewares/auth.middleware.js";

// register router //
router.route("/register").post(
    // middleware //
    upload.fields([
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

// end of register router //

// login user route //
router.route("/login").post(loginUser);
// end of login user route //

// secured routes //
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
// end of secured routes //

// update aatar image //
router
    .route("/update-avatar")
    .post(verifyJWT, upload.single("avatar"), updateAvatar);
// end of update aatar image //

// update coverImage //
router
    .route("/update-coverImage")
    .post(verifyJWT, upload.single("coverImage"), updateCoverImage);
// end of update coverImage //
export default router;
