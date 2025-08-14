// import PendingUser from "../models/pendingUser.model.js";
// import User from "../models/user.model.js";
// import jwt from "jsonwebtoken";
// import { sendEmail } from "../utils/sendEmail.js"; // Ensure sendEmail is imported



// // export const verifyOtp = async (req, res) => {
// //   try {
// //     const { email, otp } = req.body;

// //     if (!email || !otp) {
// //       return res.status(400).json({ error: "Email and OTP are required" });
// //     }

// //     const pendingUser = await PendingUser.findOne({ email });
// //     if (!pendingUser) {
// //       return res.status(400).json({ error: "No pending signup found" });
// //     }

// //     if (pendingUser.otp !== otp) {
// //       return res.status(400).json({ error: "Invalid OTP" });
// //     }

// //     if (pendingUser.otpExpires < new Date()) {
// //       await PendingUser.deleteOne({ email });
// //       return res.status(400).json({ error: "OTP expired" });
// //     }

// //     // Create actual user
// //     const user = await User.create({
// //       firstName: pendingUser.firstName,
// //       lastName: pendingUser.lastName,
// //       email: pendingUser.email,
// //       password: pendingUser.password // already hashed
// //     });

// //     // Delete from pending users
// //     await PendingUser.deleteOne({ email });

// //     // Send Welcome Email
// //     await sendEmail({
// //       to: user.email,
// //       subject: "🎉 Welcome to ScanHire AI – AI Resume Analyzer",
// //       text: `Hi ${user.firstName}, welcome to ScanHire AI! We're excited to have you onboard.`,
// //       html: `
// //       <div style="font-family: 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0f172a, #1e293b); padding: 30px;">
// //         <div style="
// //           max-width: 500px; 
// //           margin: auto; 
// //           background: rgba(255, 255, 255, 0.08); 
// //           border-radius: 15px; 
// //           overflow: hidden; 
// //           padding: 25px;
// //           border: 1px solid rgba(255, 255, 255, 0.25);
// //           box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
// //           backdrop-filter: blur(10px); 
// //           -webkit-backdrop-filter: blur(10px);
// //         ">
// //           <h2 style="color: #38bdf8; text-align: center; font-size: 22px; margin-bottom: 15px;">
// //             🚀 Welcome to ScanHire AI!
// //           </h2>
// //           <p style="color: #e2e8f0; font-size: 15px; text-align: center;">
// //             Hi <strong>${user.firstName}</strong>,<br/>
// //             Thank you for joining <strong>ScanHire AI – AI Resume Analyzer</strong>.  
// //             You're now part of a community that’s transforming the way resumes are analyzed.
// //           </p>

// //           <div style="text-align: center; margin: 25px 0;">
// //             <a href="https://scanhire.vercel.app" style="
// //               display: inline-block;
// //               padding: 12px 20px;
// //               background: linear-gradient(135deg, #38bdf8, #2563eb);
// //               color: white;
// //               text-decoration: none;
// //               font-weight: bold;
// //               border-radius: 8px;
// //               box-shadow: 0 4px 15px rgba(56, 189, 248, 0.4);
// //             ">
// //               Get Started
// //             </a>
// //           </div>

// //           <p style="color: #94a3b8; font-size: 13px; text-align: center;">
// //             Your AI-powered resume analysis journey begins now.  
// //             We can’t wait to see what you achieve!
// //           </p>

// //           <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 20px;">
// //             Cheers,<br><strong>ScanHire AI Team</strong>
// //           </p>
// //         </div>
// //         <p style="color: #cbd5e1; font-size: 12px; text-align: center; margin-top: 15px; opacity: 0.8;">
// //           © ${new Date().getFullYear()} ScanHire AI. All rights reserved.
// //         </p>
// //       </div>
// //       `
// //     });

// //     // Generate JWT
// //     const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// //     res.json({ message: "Signup successful, welcome email sent", token });

// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // };




// export const verifyOtp = async (req, res) => {
//     try {
//         const { otp, email } = req.body; // email comes from frontend stored value

//         if (!otp || !email) {
//             return res.status(400).json({ error: "OTP and stored email are required" });
//         }

//         const pendingUser = await PendingUser.findOne({ email });
//         if (!pendingUser) {
//             return res.status(400).json({ error: "No pending signup found" });
//         }

//         if (pendingUser.otp !== otp) {
//             return res.status(400).json({ error: "Invalid OTP" });
//         }

//         if (pendingUser.otpExpires < new Date()) {
//             await PendingUser.deleteOne({ email });
//             return res.status(400).json({ error: "OTP expired" });
//         }

//         // Create actual user
//         const user = await User.create({
//             firstName: pendingUser.firstName,
//             lastName: pendingUser.lastName,
//             email: pendingUser.email,
//             password: pendingUser.password // already hashed
//         });

//         // Delete from pending users
//         await PendingUser.deleteOne({ email });

//         // Send Welcome Email

//         await sendEmail({
//             to: user.email,
//             subject: "🎉 Welcome to ScanHire AI – AI Resume Analyzer",
//             text: `Hi ${user.firstName}, welcome to ScanHire AI! We're excited to have you onboard.`,
//             html: `
//       <div style="font-family: 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0f172a, #1e293b); padding: 30px;">
//         <div style="
//           max-width: 500px; 
//           margin: auto; 
//           background: rgba(255, 255, 255, 0.08); 
//           border-radius: 15px; 
//           overflow: hidden; 
//           padding: 25px;
//           border: 1px solid rgba(255, 255, 255, 0.25);
//           box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
//           backdrop-filter: blur(10px); 
//           -webkit-backdrop-filter: blur(10px);
//         ">
//           <h2 style="color: #38bdf8; text-align: center; font-size: 22px; margin-bottom: 15px;">
//             🚀 Welcome to ScanHire AI!
//           </h2>
//           <p style="color: #e2e8f0; font-size: 15px; text-align: center;">
//             Hi <strong>${user.firstName}</strong>,<br/>
//             Thank you for joining <strong>ScanHire AI – AI Resume Analyzer</strong>.  
//             You're now part of a community that’s transforming the way resumes are analyzed.
//           </p>

//           <div style="text-align: center; margin: 25px 0;">
//             <a href="https://scanhire.vercel.app" style="
//               display: inline-block;
//               padding: 12px 20px;
//               background: linear-gradient(135deg, #38bdf8, #2563eb);
//               color: white;
//               text-decoration: none;
//               font-weight: bold;
//               border-radius: 8px;
//               box-shadow: 0 4px 15px rgba(56, 189, 248, 0.4);
//             ">
//               Get Started
//             </a>
//           </div>

//           <p style="color: #94a3b8; font-size: 13px; text-align: center;">
//             Your AI-powered resume analysis journey begins now.  
//             We can’t wait to see what you achieve!
//           </p>

//           <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 20px;">
//             Cheers,<br><strong>ScanHire AI Team</strong>
//           </p>
//         </div>
//         <p style="color: #cbd5e1; font-size: 12px; text-align: center; margin-top: 15px; opacity: 0.8;">
//           © ${new Date().getFullYear()} ScanHire AI. All rights reserved.
//         </p>
//       </div>
//       `
//         });

//         // Generate JWT
//         const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

//         res.json({ message: "Signup successful", token });

//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };






import PendingUser from "../models/pendingUser.model.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

const normalizeEmail = (raw) => String(raw || "").trim().toLowerCase();


export const verifyOtp = async (req, res) => {
  try {
    const { otp, email: rawEmail } = req.body;
    const email = normalizeEmail(rawEmail);


    if (!otp || !email) {
      return res.status(400).json({ error: "OTP and email are required" });
    }

    const pendingUser = await PendingUser.findOne({ email });
    if (String(pendingUser.otp) !== String(otp)) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (pendingUser.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (pendingUser.otpExpires < new Date()) {
      await PendingUser.deleteOne({ email });
      return res.status(400).json({ error: "OTP expired" });
    }

    // Check if user already exists (to avoid duplicates)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await PendingUser.deleteOne({ email }); // cleanup
      return res.status(409).json({ error: "User already exists" });
    }

    // Create new user
    const user = await User.create({
      firstName: pendingUser.firstName,
      lastName: pendingUser.lastName,
      email: pendingUser.email,
      password: pendingUser.password, // already hashed
    });

    // Remove pending user after creation
    await PendingUser.deleteOne({ email });

    // Send welcome email without blocking the response
    try {
      await sendEmail({
        to: user.email,
        subject: "🎉 Welcome to ScanHire AI – AI Resume Analyzer",
        text: `Hi ${user.firstName}, welcome to ScanHire AI! We're excited to have you onboard.`,
        html: `
          <div style="font-family: 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0f172a, #1e293b); padding: 30px;">
            <div style="
              max-width: 500px; 
              margin: auto; 
              background: rgba(255, 255, 255, 0.08); 
              border-radius: 15px; 
              overflow: hidden; 
              padding: 25px;
              border: 1px solid rgba(255, 255, 255, 0.25);
              box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
              backdrop-filter: blur(10px); 
              -webkit-backdrop-filter: blur(10px);
            ">
              <h2 style="color: #38bdf8; text-align: center; font-size: 22px; margin-bottom: 15px;">
                🚀 Welcome to ScanHire AI!
              </h2>
              <p style="color: #e2e8f0; font-size: 15px; text-align: center;">
                Hi <strong>${user.firstName}</strong>,<br/>
                Thank you for joining <strong>ScanHire AI – AI Resume Analyzer</strong>.  
                You're now part of a community that’s transforming the way resumes are analyzed.
              </p>
              <div style="text-align: center; margin: 25px 0;">
                <a href="https://scanhire.vercel.app" style="
                  display: inline-block;
                  padding: 12px 20px;
                  background: linear-gradient(135deg, #38bdf8, #2563eb);
                  color: white;
                  text-decoration: none;
                  font-weight: bold;
                  border-radius: 8px;
                  box-shadow: 0 4px 15px rgba(56, 189, 248, 0.4);
                ">
                  Get Started
                </a>
              </div>
              <p style="color: #94a3b8; font-size: 13px; text-align: center;">
                Your AI-powered resume analysis journey begins now.  
                We can’t wait to see what you achieve!
              </p>
              <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 20px;">
                Cheers,<br><strong>ScanHire AI Team</strong>
              </p>
            </div>
            <p style="color: #cbd5e1; font-size: 12px; text-align: center; margin-top: 15px; opacity: 0.8;">
              © ${new Date().getFullYear()} ScanHire AI. All rights reserved.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Proceed without failing the response
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Return success response with token
    return res.json({ message: "Signup successful", token });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
};
