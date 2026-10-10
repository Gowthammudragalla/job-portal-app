import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { jobService, applicationService, savedJobService } from "../services/api";
import { useAuth } from "../context/AuthContext";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isStudent, isRecruiter } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchJobData = async () => {
      setLoading(true);
      try {
        const data = await jobService.getJobById(id);
        setJob(data.job);

        // If authenticated student, check if already applied or saved
        if (isAuthenticated && isStudent) {
          try {
            const [myApps, mySaved] = await Promise.all([
              applicationService.getMyApplications(),
              savedJobService.getMySavedJobs(),
            ]);

            const existingApp = myApps.applications.find(
              (app) => (app.jobId?._id || app.jobId) === id
            );
            if (existingApp) {
              setIsApplied(true);
              setApplicationStatus(existingApp.status);
            }

            const existingSaved = mySaved.savedJobs.find(
              (item) => (item.jobId?._id || item.jobId) === id
            );
            if (existingSaved) {
              setIsSaved(true);
            }
          } catch (studentErr) {
            console.error("Failed to check student status:", studentErr);
          }
        }
      } catch (err) {
        setMessage({ type: "error", text: err.message || "Failed to load job." });
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [id, isAuthenticated, isStudent]);

  // Apply Handler
  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setActionLoading(true);
    try {
      await applicationService.applyJob(id);
      setIsApplied(true);
      setApplicationStatus("Pending");
      setMessage({ type: "success", text: "Successfully applied to this position!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to apply." });
    } finally {
      setActionLoading(false);
    }
  };

  // Save / Bookmark Handler
  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      if (isSaved) {
        await savedJobService.removeSavedJob(id);
        setIsSaved(false);
        setMessage({ type: "success", text: "Removed from saved jobs." });
      } else {
        await savedJobService.saveJob(id);
        setIsSaved(true);
        setMessage({ type: "success", text: "Job saved successfully!" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update saved job." });
    }
  };

  // Recruiter Delete Handler
  const handleDeleteJob = async () => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      try {
        await jobService.deleteJob(id);
        navigate("/recruiter/dashboard");
      } catch (err) {
        setMessage({ type: "error", text: err.message || "Failed to delete job." });
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container" style={{ padding: "3rem 1rem", textAlign: "center" }}>
        <h2>Job Not Found</h2>
        <p>This job listing may have expired or been removed.</p>
        <Link to="/jobs" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          Back to All Jobs
        </Link>
      </div>
    );
  }

  const isOwner = isRecruiter && job?.recruiterId?._id === user?._id;

  return (
    <div className="job-details-page container">
      <div className="breadcrumbs">
        <Link to="/jobs">← Back to All Jobs</Link>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="job-details-card card">
        <div className="job-details-header">
          <div className="job-details-title-box">
            <h1>{job.title}</h1>
            <p className="job-company-name">{job.company}</p>
            <div className="job-details-meta">
              <span>📍 {job.location}</span>
              <span>📅 Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
              {job.recruiterId?.name && (
                <span>👤 Posted by: {job.recruiterId.name}</span>
              )}
            </div>
          </div>

          <div className="job-details-actions">
            {isStudent && (
              <>
                <button
                  onClick={handleToggleSave}
                  className={`btn ${isSaved ? "btn-secondary" : "btn-outline"}`}
                >
                  {isSaved ? "★ Saved" : "☆ Save Job"}
                </button>

                <button
                  onClick={handleApply}
                  disabled={isApplied || actionLoading}
                  className={`btn ${isApplied ? "btn-secondary" : "btn-primary"}`}
                >
                  {isApplied ? `Applied (${applicationStatus || "Pending"}) ✓` : "Apply Now"}
                </button>
              </>
            )}

            {isOwner && (
              <div className="owner-action-group">
                <Link to={`/jobs/${job._id}/edit`} className="btn btn-outline">
                  Edit Job
                </Link>
                <button onClick={handleDeleteJob} className="btn btn-danger">
                  Delete Job
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Application Status Banner for Student */}
        {isApplied && (
          <div className="application-status-banner">
            <span className="status-label">Your Application Status:</span>
            <span className={`status-badge status-${applicationStatus?.toLowerCase()}`}>
              {applicationStatus}
            </span>
          </div>
        )}

        {/* Skills Section */}
        {job.skills && job.skills.length > 0 && (
          <div className="job-details-section">
            <h3>Required Skills</h3>
            <div className="job-card-skills">
              {job.skills.map((skill, index) => (
                <span key={index} className="skill-tag skill-lg">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Job Description */}
        <div className="job-details-section">
          <h3>Job Description</h3>
          <div className="job-description-content">
            {job.description.split("\n").map((para, index) => (
              <p key={index}>{para}</p>
            ))}
          </div>
        </div>

        {/* Recruiter Contact Box */}
        {job.recruiterId && (
          <div className="recruiter-info-box">
            <h4>About the Hiring Team</h4>
            <p>
              Posted by <strong>{job.recruiterId.name}</strong>
              {job.recruiterId.email && ` (${job.recruiterId.email})`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;

