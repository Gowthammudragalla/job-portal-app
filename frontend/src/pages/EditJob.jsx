import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jobService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import JobForm from "../components/JobForm";

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await jobService.getJobById(id);
        const fetchedJob = data.job;

        // Verify that this recruiter owns the job
        const ownerId = fetchedJob.recruiterId?._id || fetchedJob.recruiterId;
        if (ownerId !== user?._id) {
          setError("You do not have permission to edit this job.");
        } else {
          setJob(fetchedJob);
        }
      } catch (err) {
        setError(err.message || "Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, user]);

  const handleUpdate = async (formData) => {
    setIsSubmitting(true);
    setError("");

    try {
      await jobService.updateJob(id, formData);
      navigate("/recruiter/dashboard");
    } catch (err) {
      setError(err.message || "Failed to update job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading job information...</p>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="container" style={{ padding: "3rem 1rem", textAlign: "center" }}>
        <h2>Unable to Edit</h2>
        <p>{error}</p>
        <Link to="/recruiter/dashboard" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="form-page container">
      <div className="breadcrumbs">
        <Link to="/recruiter/dashboard">← Back to Dashboard</Link>
      </div>

      <div className="page-header">
        <h1>Edit Job Posting</h1>
        <p>Update job requirements, description, or location</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <JobForm
        key={job._id}
        initialData={job}
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
        buttonText="Save Changes"
      />
    </div>
  );
};

export default EditJob;

