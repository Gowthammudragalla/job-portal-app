import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { savedJobService, applicationService } from "../services/api";

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const loadData = async () => {
    try {
      const [savedData, appsData] = await Promise.all([
        savedJobService.getMySavedJobs(),
        applicationService.getMyApplications(),
      ]);

      setSavedJobs(savedData.savedJobs || []);
      const applied = new Set(
        appsData.applications.map((app) => app.jobId?._id || app.jobId)
      );
      setAppliedJobIds(applied);
    } catch (err) {
      showAlert(err.message || "Failed to load saved jobs.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemove = async (jobId) => {
    try {
      await savedJobService.removeSavedJob(jobId);
      setSavedJobs((prev) => prev.filter((item) => (item.jobId?._id || item.jobId) !== jobId));
      showAlert("Job removed from saved list.");
    } catch (err) {
      showAlert(err.message || "Failed to remove job.", "error");
    }
  };

  const handleApply = async (jobId) => {
    try {
      await applicationService.applyJob(jobId);
      setAppliedJobIds((prev) => new Set(prev).add(jobId));
      showAlert("Applied successfully!");
    } catch (err) {
      showAlert(err.message || "Failed to apply.", "error");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your saved jobs...</p>
      </div>
    );
  }

  return (
    <div className="saved-jobs-page container">
      <div className="page-header">
        <h1>Saved Jobs</h1>
        <p>Manage the job opportunities you have bookmarked for later</p>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type} floating-alert`}>{alert.message}</div>
      )}

      {savedJobs.length === 0 ? (
        <div className="empty-state card">
          <span className="empty-icon">⭐</span>
          <h3>No Saved Jobs</h3>
          <p>You haven't bookmarked any jobs yet. Browse available jobs and save the ones you like.</p>
          <Link to="/jobs" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Explore Jobs
          </Link>
        </div>
      ) : (
        <div className="saved-jobs-grid">
          {savedJobs.map((item) => {
            const job = item.jobId;
            if (!job) return null;
            const isApplied = appliedJobIds.has(job._id);

            return (
              <div key={item._id} className="job-card">
                <div className="job-card-header">
                  <div>
                    <h3 className="job-card-title">
                      <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                    </h3>
                    <p className="job-card-company">{job.company}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(job._id)}
                    className="btn-icon saved"
                    title="Remove from saved jobs"
                  >
                    ★
                  </button>
                </div>

                <div className="job-card-meta">
                  <span className="meta-item">📍 {job.location}</span>
                </div>

                <p className="job-card-desc">
                  {job.description?.length > 120
                    ? `${job.description.substring(0, 120)}...`
                    : job.description}
                </p>

                {job.skills && job.skills.length > 0 && (
                  <div className="job-card-skills">
                    {job.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="job-card-footer">
                  <Link to={`/jobs/${job._id}`} className="btn btn-outline btn-sm">
                    View
                  </Link>
                  <button
                    onClick={() => handleApply(job._id)}
                    disabled={isApplied}
                    className={`btn btn-sm ${isApplied ? "btn-secondary" : "btn-primary"}`}
                  >
                    {isApplied ? "Applied ✓" : "Apply Now"}
                  </button>
                  <button
                    onClick={() => handleRemove(job._id)}
                    className="btn btn-outline btn-sm text-danger"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;

