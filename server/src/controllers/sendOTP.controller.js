import bcrypt from "bcryptjs";
import PendingUser from "../models/pendingUser.model.js";
import User from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";

const normalizeEmail = (raw) => String(raw || "").trim().toLowerCase();
export const sendOtp = async (req, res) => {
    try {
        const { firstName, lastName,  email: rawEmail, password } = req.body;
        const email = normalizeEmail(rawEmail)

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Generate OTP & expiry
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Remove old pending record if exists
        await PendingUser.findOneAndDelete({ email });

        // Save to PendingUser
        await PendingUser.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            otp,
            otpExpires,
        });

        // Check if email credentials are configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error("Email credentials not configured");
            return res.status(500).json({ 
                error: "Email service not configured. Please check server settings." 
            });
        }

        // Send OTP Email
        try {
            await sendEmail({
                to: email,
                subject: "Your  Resumind AI Verification Code",
                text: `Hello ${firstName}, Your OTP is ${otp} (valid for 5 minutes).`,
                html: `
                <div style="font-family: 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 30px;">
                  <div style="
                    max-width: 500px; 
                    margin: auto; 
                    background: rgba(255, 255, 255, 0.15); 
                    border-radius: 15px; 
                    padding: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.25);
                    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
                    backdrop-filter: blur(8px); 
                    -webkit-backdrop-filter: blur(8px);
                  ">
                    <h2 style="color: white; text-align: center;">🔐 Email Verification</h2>
                    <p style="color: white; text-align: center;">Hi <strong>${firstName}</strong>,</p>
                    <p style="color: white; text-align: center;">Use the following OTP to verify your email:</p>
                    <div style="text-align: center; margin: 20px 0;">
                      <span style="
                        font-size: 26px; 
                        letter-spacing: 5px; 
                        font-weight: bold; 
                        color: white; 
                        background: rgba(255, 255, 255, 0.25);
                        border-radius: 10px; 
                        padding: 12px 20px;
                      ">
                        ${otp}
                      </span>
                    </div>
                    <p style="color: white; text-align: center;">This code will expire in <strong>5 minutes</strong>.</p>
                  </div>
                </div>
                `,
            });
        } catch (emailError) {
            console.error("Failed to send OTP email:", emailError);
            return res.status(500).json({ 
                error: "Failed to send OTP email. Please try again later." 
            });
        }

        // Instead of making the frontend re-enter email, return it here
        res.json({
            message: "OTP sent to email",
            email, // frontend stores this for verify step
        });

    } catch (error) {
        console.error("SendOTP error:", error);
        res.status(500).json({ error: error.message });
    }
};