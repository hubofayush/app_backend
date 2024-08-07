import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.model.js";
import mongoose, { isValidObjectId } from "mongoose";
// create playlist //
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name && !description) {
        throw new ApiError(404, "name and description are required");
    }

    const playlist = await Playlist.create({
        name: name,
        description: description,
        owner: req.user?._id,
    });

    if (!playlist) {
        throw new ApiError(400, "cant create playlist on db");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, playlist, "playlist created successfully"));
});
// end of create playlist //

// get user playlists //
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(404, "user id required");
    }

    if (!isValidObjectId(userId)) {
        throw new ApiError(404, "invalid id");
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videosCount",
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "thumbnail",
                pipeline: [
                    {
                        $sort: { createdAt: -1 },
                    },
                    {
                        $limit: 1,
                    },
                    {
                        $project: {
                            thumbnail: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                thumbnail: {
                    $first: "$thumbnail",
                },
                videosCount: {
                    $size: "$videosCount",
                },
            },
        },
        {
            $project: {
                name: 1,
                description: 1,
                thumbnail: 1,
                videosCount: 1,
            },
        },
    ]);

    if (!playlist) {
        throw new ApiError(400, "cant get playlist or invalid id");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, playlist, "playlists fetched successfully"));
});
// end of get user playlists //

// get playlist by id //
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(404, "playlist id required");
    }
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(404, "invalid playlist id");
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers",
                        },
                    },
                    {
                        $addFields: {
                            subscriberCount: {
                                $size: "$subscribers",
                            },
                        },
                    },
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            subscriberCount: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
            },
        },
    ]);

    if (!playlist) {
        throw new ApiError(400, "cant find playlist on db");
    }

    return res
        .status(200)
        .json(
            new ApiResponce(200, playlist[0], "playlist fetched succsessfully"),
        );
});
// end of get playlist by id //

// add video to playlist //
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId) {
        throw new ApiError(404, "playlist id and video id required");
    }

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(404, "invalid ids");
    }

    let data = {
        _id: playlistId,
        videos: { $in: [videoId] },
    };

    const findPlaylist = await Playlist.findById(playlistId);
    if (!findPlaylist?.owner.equals(req.user?._id)) {
        throw new ApiError(404, "owenr id and user id not mathced");
    }

    const updatePlaylist = await Playlist.find(data);

    if (updatePlaylist.length === 0) {
        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            throw new ApiError(400, "cant find playlist with this id");
        }

        playlist?.videos.push(videoId);

        const updatedPlaylist = await playlist.save({
            validateBeforeSave: false,
        });

        if (!updatedPlaylist) {
            throw new ApiError(400, "video not added in playlist in db");
        }
        return res
            .status(200)
            .json(
                new ApiResponce(
                    200,
                    updatedPlaylist,
                    "video added successfully in playlist",
                ),
            );
    } else {
        res.status(200).json(
            new ApiResponce(200, [], "video is already in playlist"),
        );
    }
});
// end of add video to playlist //

// remove video to playlist //
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId) {
        throw new ApiError(404, "ids are required");
    }

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(404, "invalid ids");
    }

    const findPlaylist = await Playlist.findById(playlistId);

    if (!findPlaylist?.owner.equals(req.user?._id)) {
        throw new ApiError(404, "owenr id and user id not mathced");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId },
        },
        {
            new: true,
        },
    );

    if (!playlist) {
        throw new ApiError(400, "cant remove video from playlist in db");
    }

    const updatedPlaylist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers",
                        },
                    },
                    {
                        $addFields: {
                            subscriberCount: {
                                $size: "$subscribers",
                            },
                        },
                    },
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            subscriberCount: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
            },
        },
    ]);

    if (updatedPlaylist.length === 0) {
        return res
            .status(200)
            .json(
                new ApiResponce(200, updatedPlaylist, "playlist has no videos"),
            );
    }

    return res
        .status(200)
        .json(
            new ApiResponce(200, updatedPlaylist, "video removed succssfully"),
        );
});
// end of remove video to playlist //

// update playlist //

// delete playlist //

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
};
