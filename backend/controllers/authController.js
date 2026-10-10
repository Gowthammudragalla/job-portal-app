const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "job_portal_super_secret_jwt_key_2026";

/**
 * Register a new user (Student or Recruiter)
 * Route: POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Please provide all required fields: name, email, password, role.",
      });
    }

    // 2. Validate role
    const normalizedRole = role.toLowerCase().trim();
    if (!["student", "recruiter"].includes(normalizedRole)) {
      return res.status(400).json({
        message: "Role must be either 'student' or 'recruiter'.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 3. Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "A user with this email already exists.",
      });
    }

    // 4. Hash the password with bcrypt (salt rounds = 10)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5. Create and save user to MongoDB
    const newUser = new User({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: normalizedRole,
    });

    await newUser.save();

    // 6. Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 7. Send response (do not expose password or hash)
    return res.status(201).json({
      message: "User registered successfully!",
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    // Handle MongoDB unique duplicate key error (code 11000)
    if (error.code === 11000) {
      return res.status(400).json({
        message: "A user with this email already exists.",
      });
    }

    // Handle Mongoose schema validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    // Safe diagnostic logging without exposing sensitive payload
    console.error(`[Auth Controller] Register Error [${error.name}]:`, error.message);
    return res.status(500).json({
      message: "Server error during registration.",
      error: error.message,
    });
  }
};

/**
 * Login existing user
 * Route: POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter both email and password.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Find user by email
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password.",
      });
    }

    // 3. Compare entered password with stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password.",
      });
    }

    // 4. Generate JWT containing userId and role
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5. Return token and user info (excluding password)
    return res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(`[Auth Controller] Login Error [${error.name}]:`, error.message);
    return res.status(500).json({
      message: "Server error during login.",
      error: error.message,
    });
  }
};

/**
 * Get current authenticated user profile
 * Route: GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error(`[Auth Controller] getMe Error [${error.name}]:`, error.message);
    return res.status(500).json({
      message: "Server error fetching user profile.",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
