import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import { dbConnect } from "./config/dbConnect.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import resumeRouter from "./routes/resume.routes.js";
import session from "express-session";
import morgan from "morgan";
import jobMatchrouter from "./routes/jobMatch.route.js";

const app = express();


// Trust proxy BEFORE cookies or sessions
app.set("trust proxy", 1);

const allowedOrigins = process.env.CLIENT_URL.split(",");

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  exposedHeaders: ["Set-Cookie"] // Ensure cookies can be read by client
}));

app.use(morgan("dev"));
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cookieParser());




// ✅ Session config for prod & dev
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    proxy: true, // Add this
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 8 * 3600000 // 8 hours
    }
  })
);

app.get("/", (req, res) => {
  res.json({ message: "Server is running fine 🚀" });
});

// Health check
app.use("/healthcheck", (req, res) => {
  res.send("ScanHire AI Platform Backend is running....");
});

// Routes
app.use("/auth", authRouter);
app.use("/resume", resumeRouter);
app.use("/job", jobMatchrouter);

dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGO db Connection failed !!!", error);
  });


