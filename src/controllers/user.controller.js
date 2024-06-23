// importing async handler.js
import { asyncHandler } from "../utils/asyncHandler.js";
// importing api error
import { ApiError } from "../utils/ApiError.js";
// importing user mode
import { user } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message: "Ayush amberkar",
    // });
    // ++++++ steps ++++++ //
    // 1. get user details
    // 2. validaton - not empty
    // 3. check if user already exists: usernmae , email
    // 4. check for images, check for avatar
    // 5. upload them to cloudinary, avatar
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
    const existedUser = user.findOne({
        // operators
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "user already exist");
    }
    // end of checking user already exist

    // end of actual code //
});

export { registerUser };
