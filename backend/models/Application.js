const mongoose = require("mongoose");

// Define schema for Applications collection
const applicationSchema = new mongoose.Schema({
  // Reference to the student who applied
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Student ID is required"],
  },
  // Reference to the job applied for
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: [true, "Job ID is required"],
  },
  status: {
    type: String,
    enum: ["Pending", "Reviewed", "Shortlisted", "Accepted", "Rejected"],
    default: "Pending",
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a student can only apply once to a given job
applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;

