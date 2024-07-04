import Router from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createPlaylist,
    getPlaylistById,
    getUserPlaylists,
} from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/create-playlist").post(createPlaylist);
router.route("/user-playlists/:userId").get(getUserPlaylists);
router.route("/get-playlist/:playlistId").get(getPlaylistById);

export default router;
