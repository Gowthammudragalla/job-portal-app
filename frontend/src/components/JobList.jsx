import React from "react";
import JobCard from "./JobCard";

const JobList = ({
  jobs = [],
  loading = false,
  savedJobIds = new Set(),
  appliedJobIds = new Set(),
  onSaveToggle,
  onApply,
  onDelete,
  emptyMessage = "No jobs found matching your criteria.",
}) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Fetching opportunities...</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">🔍</span>
        <h3>No Jobs Found</h3>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="job-list-grid">
      {jobs.map((job) => (
        <JobCard
          key={job._id}
          job={job}
          isSaved={savedJobIds.has(job._id)}
          isApplied={appliedJobIds.has(job._id)}
          onSaveToggle={onSaveToggle}
          onApply={onApply}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default JobList;

