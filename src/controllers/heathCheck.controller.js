import { ApiResponce } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponce(200, {}, "Ok"));
});

export { healthCheck };
