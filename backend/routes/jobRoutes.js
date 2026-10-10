const express = require("express");
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");
const { getJobApplications } = require("../controllers/applicationController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// Public routes for viewing jobs
router.get("/", getAllJobs);
router.get("/:id", getJobById);

// Recruiter-only routes
router.post("/", verifyToken, authorizeRoles("recruiter"), createJob);
router.put("/:id", verifyToken, authorizeRoles("recruiter"), updateJob);
router.delete("/:id", verifyToken, authorizeRoles("recruiter"), deleteJob);

// View applications for a specific job (Recruiter only)
router.get(
  "/:jobId/applications",
  verifyToken,
  authorizeRoles("recruiter"),
  getJobApplications
);

module.exports = router;

