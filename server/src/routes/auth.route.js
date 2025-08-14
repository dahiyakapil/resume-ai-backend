// import express from "express"

// import { userAuth } from "../middlewares/auth.middleware.js";
// import { forgotPassword, getCurrentUser, login, logout, resetPassword, signUp, updateAvatar, updatePassword, updateProfile } from "../controllers/auth.controller.js";
// import { sendOTP } from "../controllers/sendOTP.controller.js";


// const authRouter = express.Router();


// authRouter.post("/signup", signUp)


// authRouter.post("/login", login)

// authRouter.post("/logout", logout)

// authRouter.get("/me", userAuth, getCurrentUser);

// authRouter.put("/update-profile", userAuth,  updateProfile)

// authRouter.put("/update-password", userAuth, updatePassword)

// authRouter.put("/update-avatar", userAuth, updateAvatar);


// authRouter.post("/forgot-password", forgotPassword);
// authRouter.post("/reset-password/:token", resetPassword);

// // Google
// // authRouter.get("/oauth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// // authRouter.get(
// //     "/oauth/google/callback",
// //     passport.authenticate("google", { failureRedirect: "/auth", session: true }),
// //     (req, res) => {
// //         res.redirect(`${process.env.CLIENT_URL}/oauth-redirect`);
// //     }
// // );


// // GitHub
// // authRouter.get("/oauth/github", passport.authenticate("github", { scope: ["user:email"] }));

// // authRouter.get(
// //     "/oauth/github/callback",
// //     passport.authenticate("github", { failureRedirect: "/auth", session: true }),
// //     (req, res) => {
// //         res.redirect(`${process.env.CLIENT_URL}/oauth-redirect`);
// //     }
// // );


// export default authRouter;




import express from "express";
import { userAuth } from "../middlewares/auth.middleware.js";
import { sendOtp } from "../controllers/sendOTP.controller.js";
import { signUp, login, logout, getCurrentUser, updateProfile, updatePassword, updateAvatar, forgotPassword, resetPassword, deleteUser } from "../controllers/auth.controller.js";
import { verifyOtp } from "../controllers/verifyOtpController.js";

const authRouter = express.Router();

// Step 1 — Send OTP
authRouter.post("/send-otp", sendOtp);      // Step 1: Send OTP
authRouter.post("/verify-otp", verifyOtp);


// authRouter.post("/signup", signUp);

authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", userAuth, getCurrentUser);
authRouter.put("/update-profile", userAuth, updateProfile);
authRouter.put("/update-password", userAuth, updatePassword);
authRouter.put("/update-avatar", userAuth, updateAvatar);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);


authRouter.delete("/:id", deleteUser);

export default authRouter;
