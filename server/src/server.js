// import dotenv from "dotenv";
// dotenv.config();
// import cors from "cors";
// import express from "express";
// import { dbConnect } from "./config/dbConnect.js";
// import cookieParser from "cookie-parser";
// import authRouter from "./routes/auth.route.js";
// import resumeRouter from "./routes/resume.routes.js";
// import session from "express-session";
// import morgan from "morgan";
// import jobMatchrouter from "./routes/jobMatch.route.js";

// const app = express();


// // Trust proxy BEFORE cookies or sessions
// app.set("trust proxy", 1);

// app.use(cors({
//   origin: process.env.CLIENT_URL, 
//   credentials: true 
// }));

// app.use(morgan("dev"));
// const PORT = process.env.PORT || 5000;

// // Middlewares
// app.use(express.json());
// app.use(cookieParser());




// // ✅ Session config for prod & dev
// app.use(
//   session({
//     secret: "dev-secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: process.env.NODE_ENV === "production",
//       httpOnly: true,
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//     },
//   })
// );

// app.get("/", (req, res) => {
//   res.json({ message: "Server is running fine 🚀" });
// });

// // Health check
// app.use("/healthcheck", (req, res) => {
//   res.send("ScanHire AI Platform Backend is running....");
// });

// // Routes
// app.use("/auth", authRouter);
// app.use("/resume", resumeRouter);
// app.use("/job", jobMatchrouter);

// dbConnect()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`Server is running at http://localhost:${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.log("MONGO db Connection failed !!!", error);
//   });



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
const PORT = process.env.PORT || 5000;

// ✅ 1. Trust proxy for secure cookies on Render
app.set("trust proxy", 1);

// ✅ 2. Correct CORS setup for cookies
app.use(cors({
  origin: process.env.CLIENT_URL, // e.g. https://your-frontend.vercel.app
  credentials: true
}));

app.use(morgan("dev"));

// ✅ 3. JSON + Cookie Parser
app.use(express.json());
app.use(cookieParser());

// ✅ 4. Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // secure cookies only in prod
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// ✅ 5. Routes
app.get("/", (req, res) => {
  res.json({ message: "Server is running fine 🚀" });
});

app.use("/healthcheck", (req, res) => {
  res.send("ScanHire AI Platform Backend is running....");
});

app.use("/auth", authRouter);
app.use("/resume", resumeRouter);
app.use("/job", jobMatchrouter);

// ✅ 6. Start DB + server
dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MONGO DB connection failed !!!", error);
  });
