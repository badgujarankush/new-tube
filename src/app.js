import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import ApiError from "./utils/ApiError.js";
import { errorConverter } from "./utils/Error.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// convert error to ApiError, if needed
app.use(errorConverter);

// routes import
import routes from "./routes/index.js";

// routes.declaration
app.use("/", routes);

export default app;
