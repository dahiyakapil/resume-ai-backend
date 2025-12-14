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
import adminRouter from "./routes/admin.route.js";

const app = express();


// Trust proxy BEFORE cookies or sessions
app.set("trust proxy", 1);

const allowedOrigins = ["https://resumindai-ashy.vercel.app", "http://localhost:5173"];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
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

// AUTH Routes
app.use("/api/auth", authRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/job", jobMatchrouter);


// ADMIN ROUTES
app.use("/api/admin", adminRouter)

dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGO db Connection failed !!!", error);
  });


