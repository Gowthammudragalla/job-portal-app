import React, { useState } from "react";

const SearchBar = ({ onSearch, initialFilters = {} }) => {
  const [search, setSearch] = useState(initialFilters.search || "");
  const [location, setLocation] = useState(initialFilters.location || "");
  const [company, setCompany] = useState(initialFilters.company || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      search: search.trim(),
      location: location.trim(),
      company: company.trim(),
    });
  };

  const handleReset = () => {
    setSearch("");
    setLocation("");
    setCompany("");
    onSearch({ search: "", location: "", company: "" });
  };

  return (
    <form className="search-bar-form" onSubmit={handleSubmit}>
      <div className="search-inputs-grid">
        <div className="search-input-group">
          <label htmlFor="search-title">Job Title / Keyword</label>
          <input
            id="search-title"
            type="text"
            placeholder="e.g. Software Engineer, React"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="search-input-group">
          <label htmlFor="search-location">Location</label>
          <input
            id="search-location"
            type="text"
            placeholder="e.g. Remote, New York, CA"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="search-input-group">
          <label htmlFor="search-company">Company</label>
          <input
            id="search-company"
            type="text"
            placeholder="e.g. Google, Microsoft"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
      </div>

      <div className="search-actions">
        <button type="submit" className="btn btn-primary">
          Search Jobs
        </button>
        <button type="button" onClick={handleReset} className="btn btn-outline">
          Reset
        </button>
      </div>
    </form>
  );
};

export default SearchBar;

