/**
 * API Service Module
 * Handles all HTTP requests from the React frontend to the Express backend.
 * Automatically injects the JWT token from localStorage into Authorization headers.
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Helper function to get the authentication header
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// Generic fetch handler with error parsing
const request = async (endpoint, options = {}) => {
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || "An error occurred");
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// ================= AUTH SERVICES =================
export const authService = {
  // Register a new user
  register: (userData) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  // Login existing user
  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  // Get current user profile
  getProfile: () => request("/auth/me"),
};

// ================= JOB SERVICES =================
export const jobService = {
  // Get all jobs with optional filters (search, location, company, skill, recruiterId)
  getJobs: (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.location) queryParams.append("location", filters.location);
    if (filters.company) queryParams.append("company", filters.company);
    if (filters.skill) queryParams.append("skill", filters.skill);
    if (filters.recruiterId) queryParams.append("recruiterId", filters.recruiterId);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return request(`/jobs${queryString}`);
  },

  // Get single job by ID
  getJobById: (id) => request(`/jobs/${id}`),

  // Create new job (Recruiter)
  createJob: (jobData) =>
    request("/jobs", {
      method: "POST",
      body: JSON.stringify(jobData),
    }),

  // Update existing job (Recruiter)
  updateJob: (id, jobData) =>
    request(`/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(jobData),
    }),

  // Delete job (Recruiter)
  deleteJob: (id) =>
    request(`/jobs/${id}`, {
      method: "DELETE",
    }),
};

// ================= APPLICATION SERVICES =================
export const applicationService = {
  // Apply for a job (Student)
  applyJob: (jobId) =>
    request("/applications", {
      method: "POST",
      body: JSON.stringify({ jobId }),
    }),

  // Get current student's applications
  getMyApplications: () => request("/applications/my"),

  // Get applicants for a specific job (Recruiter)
  getJobApplications: (jobId) => request(`/jobs/${jobId}/applications`),

  // Update application status (Recruiter)
  updateStatus: (applicationId, status) =>
    request(`/applications/${applicationId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};

// ================= SAVED JOBS SERVICES =================
export const savedJobService = {
  // Save / Bookmark a job (Student)
  saveJob: (jobId) =>
    request("/saved-jobs", {
      method: "POST",
      body: JSON.stringify({ jobId }),
    }),

  // Get all saved jobs for current student
  getMySavedJobs: () => request("/saved-jobs"),

  // Remove saved job (Student)
  removeSavedJob: (jobId) =>
    request(`/saved-jobs/${jobId}`, {
      method: "DELETE",
    }),
};

