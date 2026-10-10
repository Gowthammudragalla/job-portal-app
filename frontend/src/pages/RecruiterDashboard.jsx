import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jobService, applicationService } from "../services/api";

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeJobApplicants, setActiveJobApplicants] = useState(null); // { jobId, title, applicants: [] }
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const loadRecruiterJobs = useCallback(async () => {
    try {
      // Backend supports filtering by recruiterId
      const data = await jobService.getJobs({ recruiterId: user?._id });
      setJobs(data.jobs || []);
    } catch (err) {
      showAlert(err.message || "Failed to load your jobs.", "error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?._id) {
      loadRecruiterJobs();
    }
  }, [user, loadRecruiterJobs]);

  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting? All associated applications will also be removed.")) {
      try {
        await jobService.deleteJob(jobId);
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
        if (activeJobApplicants?.jobId === jobId) {
          setActiveJobApplicants(null);
        }
        showAlert("Job deleted successfully.");
      } catch (err) {
        showAlert(err.message || "Failed to delete job.", "error");
      }
    }
  };

  // View applicants modal/drawer
  const handleViewApplicants = async (job) => {
    setLoadingApplicants(true);
    try {
      const data = await applicationService.getJobApplications(job._id);
      setActiveJobApplicants({
        jobId: job._id,
        title: job.title,
        applicants: data.applications || [],
      });
    } catch (err) {
      showAlert(err.message || "Failed to fetch applicants.", "error");
    } finally {
      setLoadingApplicants(false);
    }
  };

  // Update status for a candidate
  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await applicationService.updateStatus(applicationId, newStatus);
      setActiveJobApplicants((prev) => ({
        ...prev,
        applicants: prev.applicants.map((app) =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        ),
      }));
      showAlert(`Candidate status updated to "${newStatus}".`);
    } catch (err) {
      showAlert(err.message || "Failed to update status.", "error");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your recruiter dashboard...</p>
      </div>
    );
  }

  return (
    <div className="recruiter-dashboard container">
      <div className="dashboard-header">
        <div>
          <h1>Recruiter Dashboard</h1>
          <p>
            Welcome, <strong>{user?.name}</strong>. Manage your job postings and review
            candidate applications.
          </p>
        </div>
        <Link to="/create-job" className="btn btn-primary">
          + Post New Job
        </Link>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type} floating-alert`}>{alert.message}</div>
      )}

      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📢</span>
          <div>
            <div className="stat-value">{jobs.length}</div>
            <div className="stat-label">Active Job Postings</div>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">💼</span>
          <div>
            <div className="stat-value">{user?.email}</div>
            <div className="stat-label">Recruiter Contact</div>
          </div>
        </div>
      </div>

      {/* Posted Jobs Table */}
      <div className="dashboard-section card">
        <div className="section-header">
          <h3>Your Job Listings</h3>
          <Link to="/create-job" className="btn btn-outline btn-xs">
            + Create Another
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📁</span>
            <h3>No Jobs Posted Yet</h3>
            <p>You haven't created any job openings. Post your first job now to start receiving applications!</p>
            <Link to="/create-job" className="btn btn-primary" style={{ marginTop: "1rem" }}>
              Post a Job Now
            </Link>
          </div>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Posted Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td>
                      <strong>{job.title}</strong>
                      <div className="text-muted">{job.company}</div>
                    </td>
                    <td>{job.location}</td>
                    <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => handleViewApplicants(job)}
                          className="btn btn-primary btn-xs"
                        >
                          👥 Applicants
                        </button>
                        <Link
                          to={`/jobs/${job._id}/edit`}
                          className="btn btn-outline btn-xs"
                        >
                          ✏️ Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="btn btn-danger btn-xs"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Applicants Modal / Drawer */}
      {activeJobApplicants && (
        <div className="modal-backdrop" onClick={() => setActiveJobApplicants(null)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Applicants for: {activeJobApplicants.title}</h2>
                <p className="text-muted">
                  {activeJobApplicants.applicants.length} Candidate(s) applied
                </p>
              </div>
              <button
                className="btn-close"
                onClick={() => setActiveJobApplicants(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {loadingApplicants ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Loading applicants...</p>
                </div>
              ) : activeJobApplicants.applicants.length === 0 ? (
                <div className="empty-state">
                  <p>No candidates have applied for this job yet.</p>
                </div>
              ) : (
                <div className="dashboard-table-wrapper">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Candidate Name</th>
                        <th>Email</th>
                        <th>Applied On</th>
                        <th>Current Status</th>
                        <th>Update Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeJobApplicants.applicants.map((app) => (
                        <tr key={app._id}>
                          <td>
                            <strong>{app.studentId?.name || "Student"}</strong>
                          </td>
                          <td>
                            <a href={`mailto:${app.studentId?.email}`}>
                              {app.studentId?.email || "N/A"}
                            </a>
                          </td>
                          <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                          <td>
                            <span
                              className={`status-badge status-${app.status?.toLowerCase()}`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td>
                            <select
                              value={app.status}
                              onChange={(e) =>
                                handleStatusChange(app._id, e.target.value)
                              }
                              className="status-select"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Reviewed">Reviewed</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Accepted">Accepted</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setActiveJobApplicants(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;

