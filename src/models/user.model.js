import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
    {
        user: {
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
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, // cloudnary
            required: true,
        },
        coverimage: {
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

export const user = mongoose.model("User", UserSchema);
