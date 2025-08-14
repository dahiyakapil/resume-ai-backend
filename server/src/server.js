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

// const allowedOrigins = ["https://resumindai-one.vercel.app/", "http://localhost:5173"];
const allowedOrigins = ["https://resumindai-ashy.vercel.app/"];

app.use(cors({
  origin: allowedOrigins[0], 
}));


app.use(morgan("dev"));
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cookieParser());



app.get("/", (req, res) => {
  res.json({ message: "Server is running fine 🚀" });
});

// Health check
app.use("/healthcheck", (req, res) => {
  res.send(" Resumind AI Platform Backend is running....");
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/job", jobMatchrouter);

dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGO db Connection failed !!!", error);
  });


