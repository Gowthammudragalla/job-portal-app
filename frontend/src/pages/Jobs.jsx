import React, { useState, useEffect, useCallback } from "react";
import { jobService, applicationService, savedJobService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import SearchBar from "../components/SearchBar";
import JobList from "../components/JobList";

const Jobs = () => {
  const { isAuthenticated, isStudent } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [alert, setAlert] = useState(null); // { type: 'success' | 'error', message: '' }

  // Show temporary toast/alert
  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  // Fetch jobs according to filters
  const loadJobs = useCallback(async (activeFilters) => {
    setLoading(true);
    try {
      const data = await jobService.getJobs(activeFilters);
      setJobs(data.jobs || []);
    } catch (err) {
      showAlert(err.message || "Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch student's applied & saved jobs to synchronize button states
  const loadStudentActivity = useCallback(async () => {
    if (isAuthenticated && isStudent) {
      try {
        const [appsData, savedData] = await Promise.all([
          applicationService.getMyApplications(),
          savedJobService.getMySavedJobs(),
        ]);

        const appliedIds = new Set(
          appsData.applications.map((app) => app.jobId?._id || app.jobId)
        );
        const savedIds = new Set(
          savedData.savedJobs.map((item) => item.jobId?._id || item.jobId)
        );

        setAppliedJobIds(appliedIds);
        setSavedJobIds(savedIds);
      } catch (err) {
        console.error("Failed to load student activity:", err);
      }
    }
  }, [isAuthenticated, isStudent]);

  useEffect(() => {
    loadJobs(filters);
  }, [filters, loadJobs]);

  useEffect(() => {
    loadStudentActivity();
  }, [loadStudentActivity]);

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
  };

  // Student apply handler
  const handleApply = async (jobId) => {
    if (!isAuthenticated) {
      showAlert("Please log in as a student to apply.", "error");
      return;
    }

    try {
      await applicationService.applyJob(jobId);
      setAppliedJobIds((prev) => new Set(prev).add(jobId));
      showAlert("Application submitted successfully! Check 'My Applications' to track status.");
    } catch (err) {
      showAlert(err.message || "Failed to submit application.", "error");
    }
  };

  // Student save / unsave handler
  const handleSaveToggle = async (jobId) => {
    if (!isAuthenticated) {
      showAlert("Please log in as a student to bookmark jobs.", "error");
      return;
    }

    try {
      if (savedJobIds.has(jobId)) {
        await savedJobService.removeSavedJob(jobId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
        showAlert("Job removed from saved list.");
      } else {
        await savedJobService.saveJob(jobId);
        setSavedJobIds((prev) => new Set(prev).add(jobId));
        showAlert("Job saved successfully!");
      }
    } catch (err) {
      showAlert(err.message || "Failed to update saved job.", "error");
    }
  };

  return (
    <div className="jobs-page container">
      <div className="page-header">
        <h1>Explore Job Opportunities</h1>
        <p>Browse through verified listings and find your next role</p>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type} floating-alert`}>
          {alert.message}
        </div>
      )}

      {/* Filter and Search Bar */}
      <SearchBar onSearch={handleSearch} initialFilters={filters} />

      {/* Results Header */}
      <div className="results-meta">
        <h3>{loading ? "Searching..." : `${jobs.length} Positions Available`}</h3>
      </div>

      {/* Job List */}
      <JobList
        jobs={jobs}
        loading={loading}
        savedJobIds={savedJobIds}
        appliedJobIds={appliedJobIds}
        onSaveToggle={handleSaveToggle}
        onApply={handleApply}
      />
    </div>
  );
};

export default Jobs;

