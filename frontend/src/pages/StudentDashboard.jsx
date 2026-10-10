import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { applicationService, savedJobService } from "../services/api";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appsData, savedData] = await Promise.all([
          applicationService.getMyApplications(),
          savedJobService.getMySavedJobs(),
        ]);
        setApplications(appsData.applications || []);
        setSavedJobs(savedData.savedJobs || []);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const pendingCount = applications.filter((a) => a.status === "Pending").length;
  const shortlistedCount = applications.filter((a) => a.status === "Shortlisted").length;
  const acceptedCount = applications.filter((a) => a.status === "Accepted").length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page container">
      <div className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>Welcome back, <strong>{user?.name}</strong>! Here is an overview of your job search.</p>
        </div>
        <Link to="/jobs" className="btn btn-primary">
          Browse Jobs
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📄</span>
          <div>
            <div className="stat-value">{applications.length}</div>
            <div className="stat-label">Total Applied</div>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⏳</span>
          <div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending Review</div>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🎯</span>
          <div>
            <div className="stat-value">{shortlistedCount}</div>
            <div className="stat-label">Shortlisted</div>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🎉</span>
          <div>
            <div className="stat-value">{acceptedCount}</div>
            <div className="stat-label">Accepted Offers</div>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⭐</span>
          <div>
            <div className="stat-value">{savedJobs.length}</div>
            <div className="stat-label">Saved Bookmarks</div>
          </div>
        </div>
      </div>

      {/* Recent Applications Section */}
      <div className="dashboard-section card">
        <div className="section-header">
          <h3>Recent Applications</h3>
          <Link to="/my-applications" className="btn btn-outline btn-xs">
            View All ({applications.length})
          </Link>
        </div>

        {applications.length === 0 ? (
          <p className="text-muted">You haven't applied to any jobs yet. Start exploring!</p>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 5).map((app) => (
                  <tr key={app._id}>
                    <td>
                      <strong>{app.jobId?.title || "Position Unavailable"}</strong>
                    </td>
                    <td>{app.jobId?.company || "N/A"}</td>
                    <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${app.status?.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      {app.jobId?._id && (
                        <Link to={`/jobs/${app.jobId._id}`} className="btn btn-outline btn-xs">
                          View Job
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Saved Jobs Section */}
      <div className="dashboard-section card">
        <div className="section-header">
          <h3>Saved Jobs</h3>
          <Link to="/saved-jobs" className="btn btn-outline btn-xs">
            View All ({savedJobs.length})
          </Link>
        </div>

        {savedJobs.length === 0 ? (
          <p className="text-muted">No saved jobs yet. Click the star icon on any job card to save it for later.</p>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {savedJobs.slice(0, 5).map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.jobId?.title || "Position Unavailable"}</strong>
                    </td>
                    <td>{item.jobId?.company || "N/A"}</td>
                    <td>{item.jobId?.location || "N/A"}</td>
                    <td>
                      {item.jobId?._id && (
                        <Link to={`/jobs/${item.jobId._id}`} className="btn btn-outline btn-xs">
                          View & Apply
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

