import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { applicationService } from "../services/api";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await applicationService.getMyApplications();
        setApplications(data.applications || []);
      } catch (err) {
        setError(err.message || "Failed to load applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="applications-page container">
      <div className="page-header">
        <h1>My Job Applications</h1>
        <p>Track the progress of your submitted job applications</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {applications.length === 0 ? (
        <div className="empty-state card">
          <span className="empty-icon">📝</span>
          <h3>No Applications Yet</h3>
          <p>You haven't submitted any applications. Discover open roles and apply today!</p>
          <Link to="/jobs" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Explore Available Jobs
          </Link>
        </div>
      ) : (
        <div className="applications-list-card card">
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Job Title & Company</th>
                  <th>Location</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div className="job-title-cell">
                        <strong>{app.jobId?.title || "Role Unavailable"}</strong>
                        <span className="text-muted">{app.jobId?.company || "N/A"}</span>
                      </div>
                    </td>
                    <td>{app.jobId?.location || "N/A"}</td>
                    <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${app.status?.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      {app.jobId?._id ? (
                        <Link to={`/jobs/${app.jobId._id}`} className="btn btn-outline btn-xs">
                          View Details
                        </Link>
                      ) : (
                        <span className="text-muted">Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;

