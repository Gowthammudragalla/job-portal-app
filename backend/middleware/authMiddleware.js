const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "job_portal_super_secret_jwt_key_2026";

/**
 * Authentication Middleware:
 * Verifies the JWT token from the Authorization header.
 * If valid, extracts userId and role, and attaches them to req.user.
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header is present and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    // Extract the token after 'Bearer '
    const token = authHeader.split(" ")[1];
    if (!token || token.trim() === "") {
      return res.status(401).json({
        message: "Access denied. Token is missing.",
      });
    }

    // Verify token using JWT_SECRET
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach decoded user info (userId, role) to the request object
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next(); // Proceed to next middleware or controller
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
      error: error.message,
    });
  }
};

/**
 * Role-based Authorization Middleware:
 * Checks if the authenticated user's role is included in allowedRoles.
 * Example: authorizeRoles("recruiter") or authorizeRoles("student")
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user info is attached by verifyToken
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    // Check if user has one of the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Only ${allowedRoles.join(" or ")} can perform this action.`,
      });
    }

    next(); // Role check passed, proceed to controller
  };
};

module.exports = {
  verifyToken,
  authorizeRoles,
};
