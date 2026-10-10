import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/user.model.js";
import { Profile } from "../models/profile.model.js";
import { RefreshToken } from "../models/refreshToken.js";
import { sendVerificationOtp } from "../utils/sendEmail.js";

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 7;

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

const signAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

const signRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: `${REFRESH_TOKEN_EXPIRES_IN_DAYS}d`,
    jwtid: crypto.randomUUID(),
  });
};

// Refresh tokens and OTPs are hashed before storing, so a DB leak
// can never be used to mint sessions or verify someone else's email
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const refreshCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  };
};

// Creates an access token + refresh token pair, stores the
// hashed refresh token, and sets it as an httpOnly cookie
const issueSession = async (user, res, deviceInfo) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  await RefreshToken.create({
    userId: user._id,
    token: hashToken(refreshToken),
    expiresAt: new Date(
      Date.now() + REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
    ),
    deviceInfo,
  });

  res.cookie("refreshToken", refreshToken, refreshCookieOptions());

  return accessToken;
};

// Generates a 6-digit OTP, stores its hash on the user,
// and emails the plain code to them
const createAndSendOtp = async (user) => {
  const otp = crypto.randomInt(100000, 1000000).toString();

  user.emailOtpHash = hashToken(otp);
  user.emailOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  user.emailOtpAttempts = 0;
  user.lastOtpSentAt = new Date();
  await user.save();

  await sendVerificationOtp(user.email, otp);
};

const register = async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;

    if (!email || !password || !role || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "email, password, role, firstName and lastName are required",
      });
    }

    if (!["CANDIDATE", "RECRUITER"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "role must be CANDIDATE or RECRUITER",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
    });

    await Profile.create({
      userId: user._id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });

    // No session yet: the user must verify their email first
    await createAndSendOtp(user);

    return res.status(201).json({
      success: true,
      message: "Account created. Please verify your email with the OTP we sent you.",
      data: {
        user: { id: user._id, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "email and otp are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select(
      "+emailOtpHash +emailOtpExpiresAt +emailOtpAttempts"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    // Idempotent: verifying twice is harmless
    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: "Email is already verified",
      });
    }

    if (!user.emailOtpHash || !user.emailOtpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "No active OTP. Please request a new one.",
      });
    }

    if (user.emailOtpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (user.emailOtpAttempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: "Too many wrong attempts. Please request a new OTP.",
      });
    }

    // timingSafeEqual avoids leaking information through
    // response-time differences during comparison
    const expected = Buffer.from(user.emailOtpHash, "hex");
    const actual = Buffer.from(hashToken(otp), "hex");

    const isValid =
      expected.length === actual.length &&
      crypto.timingSafeEqual(expected, actual);

    if (!isValid) {
      user.emailOtpAttempts += 1;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    user.isEmailVerified = true;
    user.emailOtpHash = undefined;
    user.emailOtpExpiresAt = undefined;
    user.emailOtpAttempts = 0;
    await user.save();

    // Now the user is fully registered, log them in
    const accessToken = await issueSession(
      user,
      res,
      req.get("user-agent")
    );

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        user: { id: user._id, email: user.email, role: user.role },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email is required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+lastOtpSentAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Cooldown stops OTP spam and mail-provider abuse
    if (
      user.lastOtpSentAt &&
      Date.now() - user.lastOtpSentAt.getTime() < OTP_RESEND_COOLDOWN_MS
    ) {
      return res.status(429).json({
        success: false,
        message: "Please wait a minute before requesting a new OTP",
      });
    }

    await createAndSendOtp(user);

    return res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Unverified users cannot log in with a random email
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    const accessToken = await issueSession(
      user,
      res,
      req.get("user-agent")
    );

    return res.status(200).json({
      success: true,
      data: {
        user: { id: user._id, email: user.email, role: user.role },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refreshToken;

    if (!rawToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const stored = await RefreshToken.findOne({
      token: hashToken(rawToken),
      isRevoked: false,
    });

    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    let payload;

    try {
      payload = jwt.verify(rawToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // Rotate: revoke the old token, issue a fresh pair
    stored.isRevoked = true;
    await stored.save();

    const accessToken = await issueSession(
      user,
      res,
      req.get("user-agent")
    );

    return res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refreshToken;

    if (rawToken) {
      await RefreshToken.updateOne(
        { token: hashToken(rawToken) },
        { isRevoked: true }
      );
    }

    res.clearCookie("refreshToken", {
      ...refreshCookieOptions(),
      maxAge: 0,
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    const profile = await Profile.findOne({ userId: req.user.id });

    return res.status(200).json({
      success: true,
      data: { user, profile },
    });
  } catch (error) {
    next(error);
  }
};

export { register, verifyEmail, resendOtp, login, refresh, logout, getMe };
