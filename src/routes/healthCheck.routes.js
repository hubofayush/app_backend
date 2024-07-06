import Router from "express";
import { healthCheck } from "../controllers/heathCheck.controller.js";
const router = Router();
router.route("/healthChekc").get(healthCheck);
export default router;
