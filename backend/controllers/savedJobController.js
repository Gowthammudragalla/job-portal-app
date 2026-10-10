const mongoose = require("mongoose");
const SavedJob = require("../models/SavedJob");
const Job = require("../models/Job");

/**
 * Save / Bookmark a job (Student only)
 * Route: POST /api/saved-jobs
 * Body: { jobId }
 */
const saveJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const studentId = req.user.userId;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "A valid Job ID is required to bookmark.",
      });
    }

    // Check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
      });
    }

    // Check if already saved
    const existingSavedJob = await SavedJob.findOne({ studentId, jobId });
    if (existingSavedJob) {
      return res.status(400).json({
        message: "Job is already bookmarked.",
      });
    }

    // Save job
    const newSavedJob = new SavedJob({
      studentId,
      jobId,
    });

    await newSavedJob.save();

    return res.status(201).json({
      message: "Job saved successfully!",
      savedJob: newSavedJob,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Job is already bookmarked.",
      });
    }

    console.error(`[SavedJob Controller] saveJob Error [${error.name}]:`, error.message);
    return res.status(500).json({
      message: "Server error saving job.",
      error: error.message,
    });
  }
};

/**
 * Get all saved jobs for current student
 * Route: GET /api/saved-jobs
 */
const getMySavedJobs = async (req, res) => {
  try {
    const studentId = req.user.userId;

    const savedJobs = await SavedJob.find({ studentId })
      .populate({
        path: "jobId",
        populate: { path: "recruiterId", select: "name email" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: savedJobs.length,
      savedJobs,
    });
  } catch (error) {
    console.error(`[SavedJob Controller] getMySavedJobs Error [${error.name}]:`, error.message);
    return res.status(500).json({
      message: "Server error fetching saved jobs.",
      error: error.message,
    });
  }
};

/**
 * Remove a job from saved jobs
 * Route: DELETE /api/saved-jobs/:jobId
 */
const removeSavedJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user.userId;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "A valid Job ID is required to remove bookmark.",
      });
    }

    const deleted = await SavedJob.findOneAndDelete({ studentId, jobId });
    if (!deleted) {
      return res.status(404).json({
        message: "Saved job not found or already removed.",
      });
    }

    return res.status(200).json({
      message: "Job removed from saved list.",
    });
  } catch (error) {
    console.error(`[SavedJob Controller] removeSavedJob Error [${error.name}]:`, error.message);
    return res.status(500).json({
      message: "Server error removing saved job.",
      error: error.message,
    });
  }
};

module.exports = {
  saveJob,
  getMySavedJobs,
  removeSavedJob,
};
