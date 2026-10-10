const mongoose = require("mongoose");

// Define schema for SavedJobs collection
const savedJobSchema = new mongoose.Schema(
  {
    // Reference to the student who saved the job
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },
    // Reference to the saved job
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job ID is required"],
    },
  },
  { timestamps: true }
);

// Prevent saving the exact same job twice for the same student
savedJobSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

const SavedJob = mongoose.model("SavedJob", savedJobSchema);

module.exports = SavedJob;

