const mongoose = require("mongoose");
const Job = require("../models/Job");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJob");

/**
 * Helper to escape special regular expression characters
 * Prevents regex injection and syntax errors (e.g., searching for "C++" or "Node.js (intern)")
 */
const escapeRegex = (string) => {
  return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

/**
 * Get all jobs with optional search and filters
 * Route: GET /api/jobs
 */
const getAllJobs = async (req, res) => {
  try {
    const { search, location, company, skill, recruiterId } = req.query;

    const filter = {};

    // Filter by keyword in title (with regex escape)
    if (search && search.trim() !== "") {
      filter.title = { $regex: escapeRegex(search.trim()), $options: "i" };
    }

    // Filter by location (with regex escape)
    if (location && location.trim() !== "") {
      filter.location = { $regex: escapeRegex(location.trim()), $options: "i" };
    }

    // Filter by company name (with regex escape)
    if (company && company.trim() !== "") {
      filter.company = { $regex: escapeRegex(company.trim()), $options: "i" };
    }

    // Filter by skill (with regex escape)
    if (skill && skill.trim() !== "") {
      filter.skills = { $regex: escapeRegex(skill.trim()), $options: "i" };
    }

    // Filter by recruiter (ensure valid ObjectId to avoid CastError)
    if (recruiterId && recruiterId.trim() !== "") {
      if (mongoose.Types.ObjectId.isValid(recruiterId.trim())) {
        filter.recruiterId = recruiterId.trim();
      }
    }

    // Retrieve jobs sorted by newest first and populate recruiter's name and email
    const jobs = await Job.find(filter)
      .populate("recruiterId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error(`[Job Controller] getAllJobs Error [${error.name}]:`, error.message);
    return res.status(500).json({
      message: "Server error fetching jobs.",
      error: error.message,
    });
  }
};

/**
 * Get a single job by ID
 * Route: GET /api/jobs/:id
 */
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId to prevent CastError 500
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        message: "Job not found.",
      });
    }

    const job = await Job.findById(id).populate("recruiterId", "name email");

    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
      });
    }

    return res.status(200).json({
      job,
    });
  } catch (error) {
    console.error(`[Job Controller] getJobById Error [${error.name}]:`, error.message);
    return res.status(500).json({
      message: "Server error fetching job details.",
      error: error.message,
    });
  }
};

/**
 * Create a new job posting (Recruiter only)
 * Route: POST /api/jobs
 */
const createJob = async (req, res) => {
  try {
    const { title, company, location, description, skills } = req.body;

    // 1. Validate required fields
    if (!title || !company || !location || !description) {
      return res.status(400).json({
        message: "Please provide title, company, location, and description.",
      });
    }

    // 2. Parse skills
    let formattedSkills = [];
    if (Array.isArray(skills)) {
      formattedSkills = skills.map((s) => s.trim()).filter(Boolean);
    } else if (typeof skills === "string" && skills.trim().length > 0) {
      formattedSkills = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // 3. Create job with recruiterId extracted from JWT
    const newJob = new Job({
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      description: description.trim(),
      skills: formattedSkills,
      recruiterId: req.user.userId,
    });

    await newJob.save();

    return res.status(201).json({
      message: "Job created successfully!",
      job: newJob,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error(`[Job Controller] createJob Error [${error.name}]:`, error.message);
    return res.status(500).json({
      message: "Server error creating job.",
      error: error.message,
    });
  }
};

/**
 * Update an existing job (Recruiter only, must own the job)
 * Route: PUT /api/jobs/:id
 */
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, company, location, description, skills } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        message: "Job not found.",
      });
    }

    // 1. Find job
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
      });
    }

    // 2. Authorization check: recruiter can only update their own job
    if (job.recruiterId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to edit this job.",
      });
    }

    // 3. Update fields
    if (title) job.title = title.trim();
    if (company) job.company = company.trim();
    if (location) job.location = location.trim();
    if (description) job.description = description.trim();

    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        job.skills = skills.map((s) => s.trim()).filter(Boolean);
      } else if (typeof skills === "string") {
        job.skills = skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    await job.save();

    return res.status(200).json({
      message: "Job updated successfully!",
      job,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error(`[Job Controller] updateJob Error [${error.name}]:`, error.message);
    return res.status(500).json({
      message: "Server error updating job.",
      error: error.message,
    });
  }
};

/**
 * Delete a job (Recruiter only, must own the job)
 * Route: DELETE /api/jobs/:id
 */
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        message: "Job not found.",
      });
    }

    // 1. Find job
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
      });
    }

    // 2. Authorization check: recruiter can only delete their own job
    if (job.recruiterId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to delete this job.",
      });
    }

    // 3. Delete job and cascade delete associated applications and saved jobs
    await Job.findByIdAndDelete(id);
    await Application.deleteMany({ jobId: id });
    await SavedJob.deleteMany({ jobId: id });

    return res.status(200).json({
      message: "Job and associated applications deleted successfully.",
    });
  } catch (error) {
    console.error(`[Job Controller] deleteJob Error [${error.name}]:`, error.message);
    return res.status(500).json({
      message: "Server error deleting job.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
};
