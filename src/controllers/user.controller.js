// importing async handler.js
import { asyncHandler } from "../utils/asyncHandler.js";
// importing api error
import { ApiError } from "../utils/ApiError.js";
// importing user model
import { User } from "../models/user.model.js";
// importing cloudinary upload function
import {
    deleteImageOnCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
//importing api responce
import { ApiResponce } from "../utils/ApiResponce.js";
// importing jwr
import jwt from "jsonwebtoken";
// importing constant options
import { options } from "../constants.js";
import mongoose from "mongoose";

// method for generate access and refresh token //
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId); // 1. find user by id

        // generating access token and refresh token
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        // updating refreshToken in database
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); // this is because we dont want to validate the password while saving refreshToken

        return { accessToken, refreshToken }; // returning accessToken and
    } catch (error) {
        throw new ApiError(
            500,
            "something went wrong while genetating access and refresh token",
        );
    }
};
// end of method for generate access and refresh token //

// Register User controller //
const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message: "Ayush amberkar",
    // });
    // ++++++ steps ++++++ //
    // 1. get user details
    // 2. validaton - not empty
    // 3. check if user already exists: usernmae , email
    // 4. check for images, check for avatar
    // 5. upload them to cloudinary, avatar and check
    // 6. create User object - create entry in db
    // 7. remove password and refresh token from responce
    // 8. Check for user creation - null or not
    // 9. Return responce
    // ++++++ end of steps ++++++ //

    // actual code //
    const { fullName, email, username, password } = req.body; // getting userdetails from frontend

    // validation
    // if (
    //     [fullName, email, password, username].some(
    //         (field) => field?.trim() === "",
    //     )
    // ) {
    //     throw new ApiError(400, "All feilds are required");
    // }
    if (!fullName || !email || !username || !password) {
        throw new ApiError(400, "all feilds are required");
    }

    // checking user already exist
    const existedUser = await User.findOne({
        // operators
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "user already exist");
    }
    // end of checking user already exist

    // checking images //
    // console.log(req.files);
    const avatarImage = req.files?.avatar[0]?.path;

    const avatarLocalPath = avatarImage; // same name as in multer
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // let coverImagetemp = req.files?.coverImage[0]?.path;
    // const coverImageLocalPath = coverImagetemp;

    let coverImageLocalPath;
    if (
        req.files && // checking is req.files availabel
        Array.isArray(req.files.coverImage) && // chekcing coverImage is array or not
        req.files.coverImage.length > 0 // checking its lenght is greater than zero
    ) {
        coverImageLocalPath = req.files.coverImage[0].path; // assign the path
    }
    // end of checking images //

    // uploading avatar and coverimage on cloudinary //
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    // end of uploading avatar and coverimage on cloudinary //

    // entry on db //
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });
    // end of entry on db //

    // chekcing user creatd or not //
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken", // we dont want this field
    );
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering user");
    }
    // end of chekcing user creatd or not //

    // sending responce //
    return res
        .status(201)
        .json(new ApiResponce(200, createdUser, "User Registered sucessfully"));
    // end of sending responce //

    // end of actual code //
});
//end of Register User controller //

// login user controller //
const loginUser = asyncHandler(async (req, res) => {
    // 1. getting data from req
    // 2. validating username or email
    // 3. finding user
    // 4. password check
    // 5. access and refresh token function
    // 6. send coockie

    // getting data from user //
    const { username, email, password } = req.body;
    // end of getting data from user //

    // validating username and password and email //
    if (!(username || email)) {
        throw new ApiError(400, "Required all credentials");
    }
    // end of validating username and password and email //

    // findig user //
    const user = await User.findOne({
        $or: [{ username }, { email }], // using operators for getting user
    });
    // end of findig user //

    // checking user is available or not //
    if (!user) {
        throw new ApiError(404, "user not found or invalid credentials");
    }
    // end of checking user is available or not //

    // validating password //
    const isPasswordValid = await user.isPasswordCorrect(password); //using self made function in user model of mongoose
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials wrong password");
    }
    // end of validating password //

    // generating accessToken and refreshToken
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id,
    );
    // end of generating accessToken and refreshToken

    // fetching user again for updated version//
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken",
    );
    // end of fetching user again //

    // making options for cookie
    const options = {
        httpOnly: true,
        secure: true,
    };
    //end of  making options for cookie

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponce(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "user loged in sucessfully",
            ),
        );
});
// end of login user controller //

// log out user //
const logoutUser = asyncHandler(async (req, res) => {
    // finding user by middleware //
    await User.findByIdAndUpdate(
        req.user._id, // getting id from middleware
        {
            // using oprator
            $set: {
                refreshToken: undefined, // removing refreshToken
            },
        },
        {
            new: true, // getting new updated user
        },
    );
    // end of finding user by middleware //

    // options for cookie //
    const options = {
        httpOnly: true,
        secure: true,
    };
    // end of options for cookie //

    // sending responce //
    return res
        .status(200)
        .clearCookie("accessToken", options) // clear cookie method //
        .clearCookie("refreshToken", options)
        .json(new ApiResponce(200, {}, "User Logged Out"));
    // end of sending responce //
});
// end of log out user //

// refresh accesstoken //
const refreshAccessToken = asyncHandler(async (req, res) => {
    // getting token //
    const incomingRefreshTOken =
        req.cookies.refreshToken || req.body.refreshToken;
    // end of getting token //

    // validating token //
    if (!incomingRefreshTOken) {
        throw new ApiError(401, "unauthorized request token not valid");
    }
    // end of validating token //

    try {
        // verify token //
        const decodedToken = jwt.verify(
            incomingRefreshTOken,
            process.env.REFRESH_TOKEN_SECRET,
        );
        // end of verify token //

        // find user //
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(
                401,
                "invalid refresh token cant find user by refresh token",
            );
        }
        // end of find user //

        // matching incoming and database refresh tokens //
        if (incomingRefreshTOken !== user?.refreshToken) {
            throw new ApiError(401, "refresh token is expired or used");
        }
        // end of matching incoming and database refresh tokens //

        // generate tokens //
        const { accessToken, newRefreshToken } =
            await generateAccessAndRefreshToken(user._id);
        // end of generate tokens //

        // sending responce //
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponce(
                    200,
                    {
                        user: user,
                        accessToken,
                        newRefreshToken,
                    },
                    "Access token refreshed",
                ),
            );
        // end of sending responce //
    } catch (error) {
        throw new ApiError(
            401,
            error?.message || "new access token not generated",
        );
    }
});
// end of refresh accesstoken //

// changeCurrentPassword //
const changeCurrentPassword = asyncHandler(async (req, res) => {
    // getting password //
    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword || newPassword)) {
        throw new ApiError(400, "old and new password cant empty");
    }
    // end of getting password //

    // getting user //
    const user = await User.findById(req.user?._id);
    // end of getting user //

    // validating password //
    const isPasswordCorrect = await user?.isPasswordCorrect(oldPassword); // using method of mongoose model
    // end of validating password //

    // validating password //
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Incorrect old password");
    }
    // validating password //

    // savig new password on db //
    user.password = newPassword;
    await user.save({ validateBeforeSave: false }); // validation off //
    // end of savig new password on db //

    // sending responce //
    return res
        .status(200)
        .json(new ApiResponce(200, {}, "password changed successfully"));
    // end of sending responce //
});

// end of changeCurrentPassword //
const getCurrentUser = asyncHandler(async (req, res) => {
    // directly return user
    return res
        .status(200)
        .json(
            new ApiResponce(200, req.user, "current user fetched successfully"),
        );
});
// get current user //

// change avatar //
const updateAvatar = asyncHandler(async (req, res) => {
    // getting user file //
    const updatedAvatarPath = req.file?.path;
    if (!updatedAvatarPath) {
        throw new ApiError(400, "avatar path is required");
    }
    //end of getting user file //

    // upload on cloudinary //
    const avatar = await uploadOnCloudinary(updatedAvatarPath);
    if (!avatar) {
        throw new ApiError(400, "Failed to upload on cloudinary");
    }
    // end of upload on cloudinary //

    // delete image //
    const deleteImage = await deleteImageOnCloudinary(req.user?.avatar);
    if (!deleteImage) {
        throw new ApiError(400, "image not deleted on cloudinary");
    }
    // delete image //

    // update on db //
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        {
            new: true,
        },
    ).select("-password");

    if (!user) {
        throw new ApiError(400, "not update on db");
    }

    // responce //
    return res
        .status(200)
        .json(new ApiResponce(200, "avatar image changed successfully"));
    // end of responce //

    // end of update on db //
});
// end of change avatar //

// update coverImage //
const updateCoverImage = asyncHandler(async (req, res) => {
    // get file path from multer //
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "cover image path required");
    }
    // end of get file path from multer //

    // upload on cloudinary //
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage) {
        throw new ApiError(400, "Error on cloudinary upload");
    }
    // upload on cloudinary //

    // delete old cover image //
    const deleteCoverImage = await deleteImageOnCloudinary(
        req.user?.coverImage,
    );
    if (!deleteCoverImage) {
        throw new ApiError(400, "Cover iMage not deleted from cloudinary");
    }
    // delete old cover image //

    // finding user //
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url,
            },
        },
        {
            new: true,
        },
    );
    // end of finding user //
    if (!user) {
        throw new ApiError(400, "Image not Uploaded on db");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, "Cover image changed successfully"));
});
// end of update coverImage //

// aggregation pipeline for user subscription //
const getUserChannelProfile = asyncHandler(async (req, res) => {
    // getting username from url link //
    const username = req.params;
    if (!username) {
        throw new ApiError(400, "username required");
    }
    // end of getting username from url link //

    // aggregate //
    const channel = await User.aggregate([
        // 1. finding  user by username //
        {
            // find uername
            $match: {
                username: username,
            },
        },
        {
            // finding user or channel subscribers
            $lookup: {
                from: "Subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            // finding user subscribed to channels
            $lookup: {
                from: "Subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            },
        },
        {
            // adding feilds
            $addFields: {
                // to count subscribers //
                subscribersCount: {
                    $size: "$subscribers",
                },
                // end of to count subscribers //

                // to count subscribed to //
                channelsubscribedToCount: {
                    $size: "$subscribedTo",
                },
                // end of to count subscribed to //

                // to find the uer is sucscribed or not to a channel //
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"],
                        },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            // projecting selected fields
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                channelsubscribedToCount: 1,
                isSubscribed: 1,
                email: 1,
            },
        },
    ]);
    // end of aggregate //

    if (!channel) {
        throw new ApiError(404, "channel does not exists");
    }

    return res.status(200).json(
        new ApiResponce(200, channel[0], "user Channel fetched successfully"), // responce is in array so we sending first object of respose array//
    );
});
// end of aggregation pipeline for user subscription //

// get watch history //
const getWatchHistory = asyncHandler(async (req, res) => {
    // aggregation //
    const user = await User.aggregate([
        {
            // matching user id //
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id), // getting user by mondodb actudal id
            },
        },
        // end of matching user //

        // lookup for watchHistory //
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",

                // sub pipeline for owner //
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            // subpipeline for selected feilds //
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        usernmae: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                            // end of subpipeline for selected feilds //
                        },
                    },
                ],
                // end of sub pipeline for owner //
            },
        },
        // end of lookup for watchHistory //
    ]);
    // end of aggregation //

    if (!user) {
        throw new ApiError(404, "cant get watch history");
    }

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                user[0].watchHistory,
                "WatchHistory fethced successfully",
            ),
        );
});
// end of get watch history //

// end of get current user //
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory,
};
