import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(
    cors({
        origin: `${process.env.ORIGIN}`,
        credentials: true,
    }),
);
app.use(cookieParser());

// Routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import commentRouter from "./routes/comment.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import likeRouter from "./routes/like.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import healthCheckRouter from "./routes/healthCheck.routes.js";
import landingPageRouter from "./routes/landingPage.routes.js";
// routes declaration
app.use("/api/v1/users", userRouter);

app.use("/api/v1/videos", videoRouter);

app.use("/api/v1/sub", subscriptionRouter);

app.use("/api/v1/pl", playlistRouter);

app.use("/api/v1/comment", commentRouter);

app.use("/api/v1/tweet", tweetRouter);

app.use("/api/v1/like", likeRouter);

app.use("/api/v1/dashboard", dashboardRouter);

app.use("/api/v1/", healthCheckRouter);

app.use("/api/v1/", landingPageRouter);
export { app };
