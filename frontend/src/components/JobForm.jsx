import React, { useState, useEffect } from "react";

const JobForm = ({ initialData = {}, onSubmit, isSubmitting = false, buttonText = "Save Job" }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    company: initialData?.company || "",
    location: initialData?.location || "",
    description: initialData?.description || "",
    skills: Array.isArray(initialData?.skills)
      ? initialData.skills.join(", ")
      : initialData?.skills || "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        title: initialData.title || "",
        company: initialData.company || "",
        location: initialData.location || "",
        description: initialData.description || "",
        skills: Array.isArray(initialData.skills)
          ? initialData.skills.join(", ")
          : initialData.skills || "",
      });
    }
  }, [initialData?.title, initialData?.company, initialData?.location, initialData?.description, initialData?.skills]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title || !formData.company || !formData.location || !formData.description) {
      setError("Please fill in all required fields.");
      return;
    }

    // Split skills string by comma into an array of trimmed strings
    const skillsArray = formData.skills
      ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    onSubmit({
      ...formData,
      skills: skillsArray,
    });
  };

  return (
    <form className="job-form card" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="title">Job Title *</label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="e.g. Frontend Developer"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="company">Company Name *</label>
          <input
            id="company"
            name="company"
            type="text"
            placeholder="e.g. Acme Innovations"
            value={formData.company}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="e.g. San Francisco, CA / Remote"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="skills">Required Skills (Comma separated)</label>
        <input
          id="skills"
          name="skills"
          type="text"
          placeholder="e.g. React, JavaScript, Node.js, Express"
          value={formData.skills}
          onChange={handleChange}
        />
        <small className="form-hint">Separate skills with commas.</small>
      </div>

      <div className="form-group">
        <label htmlFor="description">Job Description *</label>
        <textarea
          id="description"
          name="description"
          rows={6}
          placeholder="Describe the role responsibilities, qualifications, and benefits..."
          value={formData.description}
          onChange={handleChange}
          required
        ></textarea>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? "Submitting..." : buttonText}
        </button>
      </div>
    </form>
  );
};

export default JobForm;

