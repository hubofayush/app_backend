import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.model.js";

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

// get user playlist //

// get playlist by id //

// add video to playlist //

// remove video to playlist //

// update playlist //

// delete playlist //

export { createPlaylist };
