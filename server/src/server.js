// src/server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRouter from "./routes/auth.route.js";
import resumeRouter from "./routes/resume.routes.js";
import jobMatchRouter from "./routes/jobMatch.route.js";
import { dbConnect } from "./config/dbConnect.js";

const app = express();
const PORT = process.env.PORT || 5000;

// If behind a proxy (Render, Heroku, etc.) enable trust proxy so secure cookies work
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // trust first proxy
}

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Allowed origins list
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5173",
];

// Dynamic CORS options (echo origin when allowed)
const corsOptions = {
  origin: function (origin, callback) {
    // origin is undefined for same-origin or tools like curl/postman
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS: origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // enable preflight for all routes

// Session config
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // only over HTTPS in prod
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// --- Basic healthcheck ---
app.get("/healthcheck", (req, res) => res.send("ScanHire AI Platform Backend is running...."));

// --- Mount routers using PATHS (never pass full URLs here!) ---
app.use("/auth", authRouter);
app.use("/resume", resumeRouter);
app.use("/job", jobMatchRouter);

// Debug helper to ensure no url-like mounts (optional, can remove after testing)
function assertNoUrlMounts(app) {
  try {
    const stack = app._router?.stack || [];
    for (const mw of stack) {
      const repr = mw?.regexp?.toString() || mw?.route?.path || mw?.name || "";
      if (String(repr).includes("http://") || String(repr).includes("https://")) {
        console.error("Invalid mount detected:", repr);
        process.exit(1);
      }
    }
  } catch (e) {
    // ignore
  }
}
assertNoUrlMounts(app);

// Connect DB then start server
dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });
