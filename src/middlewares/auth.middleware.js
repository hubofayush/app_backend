import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // getting cookies
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("bearer", "");

        if (!token) {
            new ApiError(401, "Unauthorized access");
        }

        // verifying access token using jwt //
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // end of verifying access token using jwt //

        // finding user using this token id //
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken",
        );
        // end of finding user using this token id //

        // checking user is fetched or not //
        if (!user) {
            // frontend //
            throw new ApiError(401, "Invalid AccessToken");
        }
        // end of checking user is fetched or not //

        // adding new object in req //
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token");
    }
    // end of adding new object in req //
});
