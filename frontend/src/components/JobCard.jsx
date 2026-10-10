import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const JobCard = ({
  job,
  isSaved = false,
  isApplied = false,
  onSaveToggle,
  onApply,
  onDelete,
}) => {
  const { user, isStudent, isRecruiter } = useAuth();
  const isOwner = isRecruiter && job?.recruiterId?._id === user?._id;

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div>
          <h3 className="job-card-title">
            <Link to={`/jobs/${job._id}`}>{job.title}</Link>
          </h3>
          <p className="job-card-company">{job.company}</p>
        </div>

        {isStudent && onSaveToggle && (
          <button
            onClick={() => onSaveToggle(job._id)}
            className={`btn-icon ${isSaved ? "saved" : ""}`}
            title={isSaved ? "Remove from saved" : "Save this job"}
            aria-label="Save Job"
          >
            {isSaved ? "★" : "☆"}
          </button>
        )}
      </div>

      <div className="job-card-meta">
        <span className="meta-item">📍 {job.location}</span>
        {job.createdAt && (
          <span className="meta-item">
            📅 {new Date(job.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>

      <p className="job-card-desc">
        {job.description && job.description.length > 150
          ? `${job.description.substring(0, 150)}...`
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
          View Details
        </Link>

        {isStudent && onApply && (
          <button
            onClick={() => onApply(job._id)}
            disabled={isApplied}
            className={`btn btn-sm ${isApplied ? "btn-secondary" : "btn-primary"}`}
          >
            {isApplied ? "Applied ✓" : "Apply Now"}
          </button>
        )}

        {isOwner && (
          <div className="recruiter-card-actions">
            <Link to={`/jobs/${job._id}/edit`} className="btn btn-outline btn-sm">
              Edit
            </Link>
            <button
              onClick={() => onDelete(job._id)}
              className="btn btn-danger btn-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;

