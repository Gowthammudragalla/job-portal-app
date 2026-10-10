const express = require("express");
const router = express.Router();
const {
  saveJob,
  getMySavedJobs,
  removeSavedJob,
} = require("../controllers/savedJobController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

// All saved job routes are for students only
router.post("/", verifyToken, authorizeRoles("student"), saveJob);
router.get("/", verifyToken, authorizeRoles("student"), getMySavedJobs);
router.delete("/:jobId", verifyToken, authorizeRoles("student"), removeSavedJob);

module.exports = router;

