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

app.use(morgan("dev"));
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cookieParser());


app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true 
}));

// ✅ Session config for prod & dev
app.use(
  session({
    secret: "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
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

dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGO db Connection failed !!!", error);
  });