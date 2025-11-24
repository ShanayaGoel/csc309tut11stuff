
import express from "express";
import routes from "./routes.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// Load frontend URL from environment variable or use default
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Enable CORS for the specified frontend origin
app.use(cors({ origin: FRONTEND_URL }));

// Parse JSON request bodies
app.use(express.json());

// Mount routes at root
app.use("/", routes);

export default app;
