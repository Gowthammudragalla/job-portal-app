const mongoose = require("mongoose");
const Application = require("../models/Application");
const Job = require("../models/Job");

/**
 * Apply for a job (Student only)
 * Route: POST /api/applications
 * Body: { jobId }
 */
const applyJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const studentId = req.user.userId;

    // 1. Validate jobId
    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "A valid Job ID is required to apply.",
      });
    }

    // 2. Check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
      });
    }

    // 3. Check whether the student already applied for this job
    const existingApplication = await Application.findOne({ studentId, jobId });
    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job.",
      });
    }

    // 4. Create and save new Application
    const newApplication = new Application({
      studentId,
      jobId,
      status: "Pending",
      appliedAt: new Date(),
    });

    await newApplication.save();

    return res.status(201).json({
      message: "Application submitted successfully!",
      application: newApplication,
    });
  } catch (error) {
    // Handle MongoDB unique compound index duplicate error (E11000)
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already applied for this job.",
      });
    }

    console.error(`[Application Controller] applyJob Error [${error.name}]:`, error.message);
    return res.status(500).json({
      message: "Server error while submitting application.",
      error: error.message,
    });
  }
};

/**
 * Get all applications submitted by the logged-in student
 * Route: GET /api/applications/my
 */
const getMyApplications = async (req, res) => {
  try {
    const studentId = req.user.userId;

    // Find all applications by this student and populate job details
    const applications = await Application.find({ studentId })
      .populate("jobId", "title company location description skills")
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error(`[Application Controller] getMyApplications Error [${error.name}]:`, error.message);
    return res.status(500).json({
      message: "Server error fetching your applications.",
      error: error.message,
    });
  }
};

/**
 * Get all applications for a specific job (Recruiter only, must own the job)
 * Route: GET /api/jobs/:jobId/applications
 */
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const recruiterId = req.user.userId;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(404).json({
        message: "Job not found.",
      });
    }

    // 1. Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found.",
      });
    }

    // 2. Authorization check: recruiter must own the job
    if (job.recruiterId.toString() !== recruiterId) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to view applications for this job.",
      });
    }

    // 3. Find applications and populate student information (name, email)
    const applications = await Application.find({ jobId })
      .populate("studentId", "name email")
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      jobTitle: job.title,
      company: job.company,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error(`[Application Controller] getJobApplications Error [${error.name}]:`, error.message);
    return res.status(500).json({
      message: "Server error fetching job applications.",
      error: error.message,
    });
  }
};

/**
 * Update application status (Recruiter only)
 * Route: PUT /api/applications/:id/status
 * Body: { status }
 */
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const recruiterId = req.user.userId;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    const validStatuses = ["Pending", "Reviewed", "Shortlisted", "Accepted", "Rejected"];
    // Normalize status to Title Case if matching
    const normalizedStatus = validStatuses.find(
      (s) => s.toLowerCase() === (status || "").toLowerCase()
    );

    if (!normalizedStatus) {
      return res.status(400).json({
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Find application and populate job to verify recruiter ownership
    const application = await Application.findById(id).populate("jobId");
    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    // Verify recruiter owns this job
    if (application.jobId.recruiterId.toString() !== recruiterId) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to update this application.",
      });
    }

    application.status = normalizedStatus;
    await application.save();

    return res.status(200).json({
      message: "Application status updated successfully!",
      application,
    });
  } catch (error) {
    console.error(`[Application Controller] updateApplicationStatus Error [${error.name}]:`, error.message);
    return res.status(500).json({
      message: "Server error updating application status.",
      error: error.message,
    });
  }
};

module.exports = {
  applyJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
};
