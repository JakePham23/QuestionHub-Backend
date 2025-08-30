// src/routes/exams.js
import { Router } from "express";
import db from "../../db.js";
import express from "express";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// 1. Google Sign-In
router.post("/google/signin", async (req, res) => {
  try {
    const { idToken } = req.body;
    console.log(" Received ID token from backend:", idToken);

    if (!idToken) {
      console.log(" No ID token provided");
      return res.status(400).json({
        success: false,
        message: "ID token is required.",
      });
    }

    console.log(" ID token received, length:", idToken.length);

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload["sub"];
    const email = payload["email"];
    const name = payload["name"];
    const picture = payload["picture"];
    const emailVerified = payload["email_verified"];

    if (!emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Google email not verified.",
      });
    }

    const sanitizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const userQuery = `
      SELECT user_id, email, username, google_id, profile_picture, created_at 
      FROM users 
      WHERE email ILIKE $1 OR google_id = $2
    `;
    const userResult = await db.query(userQuery, [sanitizedEmail, googleId]);

    let user;

    if (userResult.rows.length === 0) {
      // Create new user
      const insertQuery = `
        INSERT INTO users (email, username, google_id, profile_picture, email_verified, created_at)
        VALUES ($1, $2, $3, $4, true, NOW())
        RETURNING user_id, email, username, google_id, profile_picture, created_at
      `;
      const newUserResult = await db.query(insertQuery, [
        sanitizedEmail,
        name,
        googleId,
        picture,
      ]);
      user = newUserResult.rows[0];
    } else {
      user = userResult.rows[0];

      // Update Google ID if user exists but doesn't have it
      if (!user.google_id) {
        const updateQuery = `
          UPDATE users 
          SET google_id = $1, profile_picture = $2, email_verified = true, updated_at = NOW()
          WHERE user_id = $3
          RETURNING user_id, email, username, google_id, profile_picture, created_at
        `;
        const updatedUserResult = await db.query(updateQuery, [
          googleId,
          picture,
          user.user_id,
        ]);
        user = updatedUserResult.rows[0];
      }
    }

    // Generate JWT token
    const authToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    // Clean up old refresh tokens and store new one
    await db.query("DELETE FROM refresh_tokens WHERE user_id = $1", [user.id]);
    const refreshTokenQuery = `
      INSERT INTO refresh_tokens (user_id, token, expires_at, created_at)
      VALUES ($1, $2, NOW() + INTERVAL '30 days', NOW())
    `;
    await db.query(refreshTokenQuery, [user.user_id, refreshToken]);

    return res.json({
      success: true,
      message: "Google sign-in successful.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profilePicture: user.profile_picture,
          createdAt: user.created_at,
        },
        authToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Error in Google sign-in:", error);

    if (error.message.includes("Token used too early")) {
      return res.status(400).json({
        success: false,
        message: "Invalid token timing. Please try again.",
      });
    }

    if (error.message.includes("Invalid token")) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google token.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required.",
      });
    }
    console.log("Received refresh token:", refreshToken);
    console.log("Secret: ", process.env.JWT_REFRESH_SECRET);
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    // Check if refresh token exists in database and is not expired
    const tokenQuery = `
      SELECT rt.*, u.email, u.username 
      FROM refresh_tokens rt 
      JOIN users u ON rt.user_id = u.user_id 
      WHERE rt.token = $1 AND rt.expires_at > NOW()
    `;
    const tokenResult = await db.query(tokenQuery, [refreshToken]);

    if (tokenResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired refresh token.",
      });
    }
    const tokenData = tokenResult.rows[0];

    // Generate new access token
    const newAuthToken = jwt.sign(
      {
        userId: tokenData.user_id,
        email: tokenData.email,
        username: tokenData.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      { userId: tokenData.user_id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    // Update refresh token in database
    const updateQuery = `
      UPDATE refresh_tokens 
      SET token = $1, expires_at = NOW() + INTERVAL '30 days', created_at = NOW()
      WHERE user_id = $2
    `;
    await db.query(updateQuery, [newRefreshToken, tokenData.user_id]);

    return res.json({
      success: true,
      message: "Token refreshed successfully.",
      data: {
        authToken: newAuthToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error("Error in refresh token:", error);
    return res.status(403).json({
      success: false,
      message: "Invalid refresh token.",
    });
  }
});

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userQuery = ` SELECT *
      FROM users 
      WHERE user_id = $1
    `;
    const userResult = await db.query(userQuery, [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = userResult.rows[0];
    return res.json({
      success: true,
      message: "User data retrieved successfully.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profilePicture: user.profile_picture,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      },
    });
  } catch (error) {
    console.error("Error in get current user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});
// 4. Logout
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    await db.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);

    return res.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Error in logout:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Username, email, and password are required." });
  }

  try {
    const saltRounds = 10; // A good standard for the salt rounds
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
       RETURNING user_id, username, email, created_at, is_active;
    `;

    const queryParams = [username, email, passwordHash];

    const { rows } = await db.query(query, queryParams);
    const newUser = rows[0];

    res.status(201).json({
      message: "User created successfully!",
      user: newUser,
    });
  } catch (error) {
    console.error("Error during signup:", error);

    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: "Username or email already exists." });
    }

    res.status(500).json({ message: "Internal server error." });
  }
});


// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send OTP email function
async function sendOTPEmail(email, otp) {
  const transporter = createTransporter();

  const mailOptions = {
    from: {
      name: "QuestionHub",
      address: process.env.EMAIL_USER,
    },
    to: email,
    subject: "🔐 Your Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset OTP</h2>
        <p>Hello,</p>
        <p>You requested to reset your password. Use the OTP below to verify and reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f8f9fa; 
                      border: 2px dashed #007bff; 
                      padding: 20px; 
                      border-radius: 10px;
                      display: inline-block;">
            <h1 style="color: #007bff; margin: 0; font-size: 32px; letter-spacing: 5px;">
              ${otp}
            </h1>
          </div>
        </div>
        
        <p><strong>This OTP will expire in 10 minutes.</strong></p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        
        <hr style="margin: 30px 0; border: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This email was sent to ${email}
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to: ${email}`);
  } catch (error) {
    console.error(` Failed to send OTP email to ${email}:`, error);
    throw error;
  }
}
// Step 1: Request password reset (send OTP)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const userQuery = "SELECT * FROM users WHERE email ILIKE $1";
    const userResult = await db.query(userQuery, [sanitizedEmail]);

    // Only if the user exists, we generate and send the OTP
    if (userResult.rows.length > 0) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

      // Store OTP in database
      await db.query(
        `INSERT INTO password_resets (email, otp, otp_expires_at, used, created_at)
         VALUES ($1, $2, $3, FALSE, NOW())
         ON CONFLICT (email) 
         DO UPDATE SET otp = $2, otp_expires_at = $3, used = FALSE, created_at = NOW()`,
        [sanitizedEmail, otp, otpExpiresAt]
      );

      // Send OTP via email
      await sendOTPEmail(sanitizedEmail, otp);

      console.info(
        `Password reset OTP sent to ${sanitizedEmail}: ${otp} (expires ${otpExpiresAt.toISOString()})`
      );
    } else {
      console.info(`No user found with email: ${sanitizedEmail}`);
    }

    // Always return success to prevent email enumeration
    return res.json({
      success: true,
      message:
        "If an account with that email exists, an OTP has been sent to it.",
    });
  } catch (error) {
    console.error("Error in forgot-password:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
});

// Step 2: Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required." });
    }

    const sanitizedEmail = email.toLowerCase().trim();

    // Check if OTP exists and is valid
    const otpQuery = `
      SELECT * FROM password_resets 
    WHERE email ILIKE $1 AND otp = $2 AND used = FALSE AND otp_expires_at > NOW()
    `;
    const otpResult = await db.query(otpQuery, [sanitizedEmail, otp]);

    if (otpResult.rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP." });
    }

    return res.json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
      data: { email: sanitizedEmail },
    });
  } catch (error) {
    console.error("Error in verify-otp:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    const sanitizedEmail = email.toLowerCase().trim();

    const otpQuery = `
      SELECT * FROM password_resets 
      WHERE email ILIKE $1 AND otp = $2 AND used = FALSE AND otp_expires_at > NOW()
    `;
    const otpResult = await db.query(otpQuery, [sanitizedEmail, otp]);

    if (otpResult.rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP." });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await db.query("UPDATE users SET password_hash = $1 WHERE email ILIKE $2", [
      hashedPassword,
      sanitizedEmail,
    ]);

    // Mark OTP as used
    await db.query(
      "UPDATE password_resets SET used = TRUE WHERE email ILIKE $1 AND otp = $2",
      [sanitizedEmail, otp]
    );

    return res.json({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error("Error in reset-password:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
});

export default router;
