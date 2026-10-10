import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jobService } from "../services/api";
import JobCard from "../components/JobCard";

const Home = () => {
  const { isAuthenticated, isStudent } = useAuth();
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await jobService.getJobs();
        // Take top 3 recent jobs for home preview
        setRecentJobs(data.jobs.slice(0, 3));
      } catch (err) {
        console.error("Failed to load featured jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-content">
          <span className="hero-badge">🚀 Next-Gen Career Platform</span>
          <h1 className="hero-title">
            Connect Your Passion <br /> With The Perfect Career
          </h1>
          <p className="hero-subtitle">
            Whether you are a student launching your journey or a recruiter building a
            world-class team, JobPortal provides a seamless, transparent hiring experience.
          </p>

          <div className="hero-cta">
            <Link to="/jobs" className="btn btn-primary btn-lg">
              Explore Available Jobs
            </Link>

            {!isAuthenticated ? (
              <Link to="/register" className="btn btn-outline btn-lg">
                Create Free Account
              </Link>
            ) : isStudent ? (
              <Link to="/dashboard" className="btn btn-outline btn-lg">
                Go to Student Dashboard
              </Link>
            ) : (
              <Link to="/recruiter/dashboard" className="btn btn-outline btn-lg">
                Go to Recruiter Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="container features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎓</div>
            <h3>For Students</h3>
            <p>
              Browse verified job opportunities, filter by location, company, or skills, and
              apply with a single click. Keep track of all application statuses in real-time.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏢</div>
            <h3>For Recruiters</h3>
            <p>
              Post job openings quickly, manage and edit listings, and review incoming
              student applications with full candidate profile visibility.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Clean & Secure Architecture</h3>
            <p>
              Built using Node.js, Express, MongoDB, and React with JWT authentication,
              bcrypt password hashing, and role-based access control.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Jobs Preview */}
      <section className="container recent-jobs-section">
        <div className="section-header">
          <div>
            <h2>Featured Job Openings</h2>
            <p>Discover the latest roles posted by top companies</p>
          </div>
          <Link to="/jobs" className="btn btn-outline btn-sm">
            View All Jobs →
          </Link>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading recent openings...</p>
          </div>
        ) : recentJobs.length > 0 ? (
          <div className="job-list-grid">
            {recentJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No jobs posted yet. Recruiters can post the first role!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

