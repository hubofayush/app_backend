import mongoose, { Schema } from "mongoose";

// import bcryptjs from "bcryptjs";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// --- UserSchema --- //
const UserSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            lowecase: true,
            unique: true,
            index: true,
            trim: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, // cloudnary
            required: true,
        },
        coverImage: {
            type: String, //cloudnary
        },
        warchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        refreshToken: {
            type: String,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
    },
    { timestamps: true },
);
// --- UserSchema --- //

// --- hooks --- //

// to hash password
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // checking the password is changed or not
    this.password = await bcrypt.hash(this.password, 10); // to hash password

    next();
});
// end of hash password

// to check password is correct
UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};
// end of check password is correct

// --- Generating Tokens --- //
// Create access token
UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.userName,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        },
    );
};
//end of Create access token

// create refresh token
UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        },
    );
};
// end of create refresh token

// --- end of Generating Tokens --- //

export const User = mongoose.model("User", UserSchema);
