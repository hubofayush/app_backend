// importing async handler.js
import { asyncHandler } from "../utils/asyncHandler.js";
// importing api error
import { ApiError } from "../utils/ApiError.js";
// importing user mode
import { User } from "../models/user.model.js";
// importing cloudinary upload function
import { uploadOnCloudinary } from "../utils/cloudinary.js";
//importing api responce
import { ApiResponce } from "../utils/ApiResponce.js";

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

    const avatarImage = req.files?.avatar[0]?.path;

    const avatarLocalPath = avatarImage; // same name as in multer
    console.log(typeof avatarLocalPath);
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // let coverImagetemp = req.files?.coverImage[0]?.path;
    // const coverImageLocalPath = coverImagetemp;

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    // end of checking images //

    // uploading avatar and coverimage on cloudinary //
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log(avatar);
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

export { registerUser };
