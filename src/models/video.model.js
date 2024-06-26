import mongoose from "mongoose";
import { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new Schema(
    {
        videoFile: {
            type: String, // cloudnary
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        views: {
            type: Number,
            default: 0,
        },
        duration: {
            type: Number, // cloudnary
            required: true,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        publicId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
);

// middleware plugin
VideoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", VideoSchema);
