import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, isStudent, isRecruiter, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">💼</span>
          <span className="brand-text">JobPortal</span>
        </Link>

        <nav className="navbar-links">
          <NavLink
            to="/jobs"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Explore Jobs
          </NavLink>

          {/* Student navigation items */}
          {isAuthenticated && isStudent && (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/my-applications"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                My Applications
              </NavLink>
              <NavLink
                to="/saved-jobs"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Saved Jobs
              </NavLink>
            </>
          )}

          {/* Recruiter navigation items */}
          {isAuthenticated && isRecruiter && (
            <>
              <NavLink
                to="/recruiter/dashboard"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Recruiter Dashboard
              </NavLink>
              <NavLink
                to="/create-job"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                + Post Job
              </NavLink>
            </>
          )}
        </nav>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className={`role-badge ${user?.role}`}>
                {user?.role === "recruiter" ? "Recruiter" : "Student"}
              </span>
              <span className="user-name">{user?.name}</span>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

