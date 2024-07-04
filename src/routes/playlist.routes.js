import Router from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addVideoToPlaylist,
    createPlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/create-playlist").post(createPlaylist);
router.route("/user-playlists/:userId").get(getUserPlaylists);
router.route("/get-playlist/:playlistId").get(getPlaylistById);
router.route("/avt-playlist/:playlistId/:videoId").post(addVideoToPlaylist);
router
    .route("/rvf-playlist/:playlistId/:videoId")
    .delete(removeVideoFromPlaylist);

export default router;
