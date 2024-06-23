// importing async handler.js
import { asyncHandler } from "../utils/asyncHandler.js";
// importing api error
import { ApiError } from "../utils/ApiError.js";
// importing user mode
import { User } from "../models/user.model.js";
// importing cloudinary upload function
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
    if (
        [fullName, email, password, username].some(
            (field) => field?.trim() === "",
        )
    ) {
        throw new ApiError(400, "All feilds are required");
    }

    // checking user already exist
    const existedUser = User.findOne({
        // operators
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "user already exist");
    }
    // end of checking user already exist

    // checking images //
    const avatarLocalPath = req.files?.avatar[0].path; // same name as in multer
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const coverImageLocalPath = req.files?.coverImage[0].path;

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
    const checkUser = await User.findById(user._id).select(
        "-password -refreshToken", // we dont want this field
    );
    if (!checkUser) {
        throw new ApiError(500, "something went wrong while registering user");
    }
    // end of chekcing user creatd or not //
    // end of actual code //
});

export { registerUser };
