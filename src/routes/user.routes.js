import { Router } from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
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
// end of secured routes //

export default router;
