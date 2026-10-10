import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/jobs";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await login(email, password);
      // Navigate to recruiter dashboard or student dashboard/jobs
      if (response.user.role === "recruiter") {
        navigate("/recruiter/dashboard");
      } else {
        navigate(from === "/login" ? "/jobs" : from);
      }
    } catch (err) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo helpers for easy testing during demos and interviews
  const fillStudentDemo = () => {
    setEmail("alice@university.edu");
    setPassword("SecretPassword1");
  };

  const fillRecruiterDemo = () => {
    setEmail("recruiter@google.com");
    setPassword("Password123");
  };

  return (
    <div className="auth-page container">
      <div className="auth-card card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Log in to access your jobs, applications, and saved bookmarks</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-block"
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Quick Demo Fill Buttons for Interview/Testing */}
        <div className="demo-credentials-box">
          <p className="demo-label">💡 Quick Test Credentials:</p>
          <div className="demo-buttons">
            <button
              type="button"
              onClick={fillStudentDemo}
              className="btn btn-outline btn-xs"
            >
              Fill Student Demo
            </button>
            <button
              type="button"
              onClick={fillRecruiterDemo}
              className="btn btn-outline btn-xs"
            >
              Fill Recruiter Demo
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

