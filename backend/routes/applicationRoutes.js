const express = require("express");
const router = express.Router();
const {
  applyJob,
  getMyApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// Student-only: apply for a job
router.post("/", verifyToken, authorizeRoles("student"), applyJob);

// Student-only: view my submitted applications
router.get("/my", verifyToken, authorizeRoles("student"), getMyApplications);

// Recruiter-only: update status of an application
router.put(
  "/:id/status",
  verifyToken,
  authorizeRoles("recruiter"),
  updateApplicationStatus
);

module.exports = router;

