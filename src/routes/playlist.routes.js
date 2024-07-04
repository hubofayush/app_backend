import Router from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPlaylist } from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/create-playlist").post(createPlaylist);

export default router;
