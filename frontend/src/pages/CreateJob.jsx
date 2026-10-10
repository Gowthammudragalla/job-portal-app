import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jobService } from "../services/api";
import JobForm from "../components/JobForm";

const CreateJob = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (formData) => {
    setIsSubmitting(true);
    setError("");

    try {
      await jobService.createJob(formData);
      navigate("/recruiter/dashboard");
    } catch (err) {
      setError(err.message || "Failed to create job posting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-page container">
      <div className="breadcrumbs">
        <Link to="/recruiter/dashboard">← Back to Dashboard</Link>
      </div>

      <div className="page-header">
        <h1>Post a New Job Opportunity</h1>
        <p>Fill in the details below to publish your opening to students</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <JobForm
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
        buttonText="Publish Job Posting"
      />
    </div>
  );
};

export default CreateJob;

