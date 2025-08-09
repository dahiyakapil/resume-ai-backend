import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import { db } from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import resumeRouter from "./routes/resume.routes.js";
import session from "express-session";
import morgan from "morgan";
import jobMatchrouter from "./routes/jobMatch.route.js";

const app = express();
app.use(morgan("dev"));
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cookieParser());


// If behind a proxy (Render, Heroku, etc.) enable trust proxy so secure cookies work
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // trust first proxy
}

// Allowed origins list
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5173"
];

// Dynamic CORS options that reflect origin when allowed
const corsOptions = {
  origin: function (origin, callback) {
    // `origin` will be undefined for same-origin requests or tools like curl/postman.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      // echo the origin back in Access-Control-Allow-Origin
      return callback(null, true);
    } else {
      return callback(new Error("CORS: Origin not allowed"), false);
    }
  },
  credentials: true, // Access-Control-Allow-Credentials: true
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

// Apply CORS BEFORE session and routes so preflight is handled early
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // enable preflight for all routes

// Session config
app.use(
  session({
    name: "sid", // optional custom cookie name
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // send cookie only over HTTPS in prod
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // cross-site in prod
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  })
);


// Health check
app.use("/healthcheck", (req, res) => {
  res.send("ScanHire AI Platform Backend is running....");
});

// Routes
app.use("/auth", authRouter);
app.use("/resume", resumeRouter);
app.use("/job", jobMatchrouter);

db()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGO db Connection failed !!!", error);
  });
