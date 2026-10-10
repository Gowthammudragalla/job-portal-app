# Job Portal — Full-Stack Web Application

A full-stack web application designed for students to discover, bookmark, and apply for jobs, and for recruiters to post, update, and manage job listings and review applicants.

---

## 🏗️ Tech Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, JavaScript, CSS3 | Fast development server, component-based UI, reusable design, responsive layouts. |
| **Backend** | Node.js, Express.js | Asynchronous event-driven I/O, minimalist routing, standard REST API conventions. |
| **Database** | MongoDB, Mongoose | Flexible document model, fast JSON-like BSON storage, schema validation and relationship references. |
| **Security** | JWT, bcryptjs | Stateless authorization token header, secure one-way salted password hashing. |

---

## 📁 Project Structure

```text
job-portal/
├── backend/
│   ├── models/
│   │   ├── User.js            # User Schema (Student & Recruiter roles)
│   │   ├── Job.js             # Job Schema with recruiterId reference
│   │   ├── Application.js     # Application Schema (studentId & jobId reference)
│   │   └── SavedJob.js        # SavedJob Schema (studentId & jobId reference)
│   ├── controllers/
│   │   ├── authController.js        # Register, Login, Current User profile
│   │   ├── jobController.js         # Jobs CRUD & search / filters
│   │   ├── applicationController.js # Apply for job, view student & recruiter apps
│   │   └── savedJobController.js    # Save / bookmark & remove saved jobs
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth
│   │   ├── jobRoutes.js         # /api/jobs
│   │   ├── applicationRoutes.js # /api/applications
│   │   └── savedJobRoutes.js    # /api/saved-jobs
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT token verification & role authorization
│   ├── .env                     # PORT, MONGO_URI, JWT_SECRET
│   ├── .env.example             # Template for configuration
│   ├── package.json
│   └── server.js                # Express app setup, DB connection, CORS, error handling
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Responsive header with role-aware actions
│   │   │   ├── JobCard.jsx          # Reusable job card with apply/save/edit buttons
│   │   │   ├── JobList.jsx          # Grid display of job cards + empty state
│   │   │   ├── SearchBar.jsx        # Keyword, location, and company search form
│   │   │   ├── JobForm.jsx          # Reusable form for job creation & editing
│   │   │   └── ProtectedRoute.jsx   # Route guard by authentication and user role
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page with hero banner & job highlights
│   │   │   ├── Login.jsx            # User sign in with quick demo shortcuts
│   │   │   ├── Register.jsx         # Account creation with student/recruiter toggle
│   │   │   ├── Jobs.jsx             # Search, filter, apply, and save jobs
│   │   │   ├── JobDetails.jsx       # Complete job details & status tracker
│   │   │   ├── StudentDashboard.jsx # Student metrics & recent activity
│   │   │   ├── MyApplications.jsx   # List of submitted applications + status badges
│   │   │   ├── SavedJobs.jsx        # Bookmarked jobs management
│   │   │   ├── RecruiterDashboard.jsx # Recruiter job postings & candidate modal
│   │   │   ├── CreateJob.jsx        # Post a new job
│   │   │   └── EditJob.jsx          # Edit existing job
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global user state & token storage
│   │   ├── services/
│   │   │   └── api.js               # Centralized REST API client with JWT header injection
│   │   ├── App.jsx                  # React Router configuration
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Modern CSS styling system
│   ├── package.json
│   └── vite.config.js
│
├── package.json                     # Root orchestrator scripts
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
Create a `.env` file inside the `backend/` directory based on `backend/.env.example`:
```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your_long_random_jwt_secret_key
```

### Frontend (`frontend/.env`)
Create a `.env` file inside the `frontend/` directory based on `frontend/.env.example`:
```env
VITE_API_URL=http://localhost:5001/api
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (free tier) or local MongoDB instance

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The server will run on `http://localhost:5001`.

### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Vite will start the client on `http://localhost:5173`.

### 3. Root Commands (Alternative)
From the root `Job-portal/` directory:
- Run backend: `npm run backend`
- Run frontend: `npm run frontend`
- Build frontend: `npm run build:frontend`

---

## 🗄️ Database Collections & Relationships

### 1. `Users`
- `_id`: ObjectId
- `name`: String
- `email`: String (Unique)
- `password`: String (Bcrypt salted hash)
- `role`: String (`student` or `recruiter`)

### 2. `Jobs`
- `_id`: ObjectId
- `title`: String
- `company`: String
- `location`: String
- `description`: String
- `skills`: Array of Strings
- `recruiterId`: ObjectId (Ref: `User`)

### 3. `Applications`
- `_id`: ObjectId
- `studentId`: ObjectId (Ref: `User`)
- `jobId`: ObjectId (Ref: `Job`)
- `status`: String (`Pending`, `Reviewed`, `Accepted`, `Rejected`)
- `appliedAt`: Date

### 4. `SavedJobs`
- `_id`: ObjectId
- `studentId`: ObjectId (Ref: `User`)
- `jobId`: ObjectId (Ref: `Job`)

---

## 🔒 Security Practices
1. **Password Hashing**: Passwords hashed with `bcryptjs` using 10 salt rounds before database insertion.
2. **Never Return Passwords**: Mongoose queries omit passwords or controllers selectively exclude password fields.
3. **Stateless JWT Authorization**: Tokens are verified on every protected request.
4. **Role-Based Authorization**: Middleware ensures students cannot create/edit jobs and recruiters cannot apply for jobs.
5. **Ownership Enforcement**: Recruiters can only modify or delete jobs they personally created (`job.recruiterId === req.user.userId`).
6. **Duplicate Prevention**: Compound indexes `{ studentId: 1, jobId: 1 }` prevent multiple applications or duplicate bookmarks for the same job.

---

## 🎓 Technical Interview Q&A Guide

### Q1: Why React for the frontend?
**Answer**: React provides a component-based architecture where UI elements like `JobCard`, `Navbar`, and `SearchBar` are modular and reusable. React's virtual DOM allows efficient re-rendering when filters or application states change without reloading the whole page.

### Q2: Why Node.js & Express.js for the backend?
**Answer**: Node.js operates on an event-driven, non-blocking I/O model, making it lightweight and suitable for I/O-intensive RESTful APIs. Express is a minimalist framework that provides clean routing, middleware pipelines, and request handling with low overhead.

### Q3: Why MongoDB and Mongoose?
**Answer**: MongoDB stores data as JSON-like documents (BSON), which maps naturally to JavaScript objects. Mongoose adds a schema layer on top of MongoDB for validation, type casting, default values, and reference population (`populate`).

### Q4: Why doesn't MongoDB need traditional SQL foreign keys?
**Answer**: SQL databases require physical relational constraints and JOIN operations across fixed tables. MongoDB uses **ID references** (e.g. `recruiterId` storing an `ObjectId`). Mongoose's `.populate()` replaces references with referenced documents at query time, keeping the database flexible while retaining relational integrity.

### Q5: What is JWT and how does it identify a user?
**Answer**: JSON Web Token is a compact, URL-safe standard used for securely transmitting information between parties as a JSON object. A JWT consists of three parts:
- **Header**: Signing algorithm used (e.g. HS256).
- **Payload**: User claims (`userId`, `role`, expiration).
- **Signature**: Verifies that the sender is authentic and the token hasn't been tampered with.
When the user logs in, the backend signs the JWT with `JWT_SECRET`. On subsequent requests, the frontend sends this token in the `Authorization: Bearer <token>` header. The backend verifies the signature and decodes the `userId` and `role`.

### Q6: Authentication vs Authorization?
**Answer**:
- **Authentication**: Verifies *who* the user is (e.g., verifying email & bcrypt password match, generating JWT).
- **Authorization**: Determines *what permissions* the authenticated user has (e.g., role-based middleware checking if `role === 'recruiter'` before allowing `POST /api/jobs`).

### Q7: What is middleware in Express?
**Answer**: Middleware functions are functions that have access to the request (`req`), response (`res`), and the `next` function in the application’s request-response cycle. They can execute code, modify `req` / `res`, end the request, or call `next()` to pass control to the next middleware. Example: `verifyToken` inspects the Authorization header, validates the JWT, and attaches `req.user`.

### Q8: How does the "Apply Job" flow work end-to-end?
```text
1. Student clicks "Apply Now" in React UI.
2. Frontend sends POST /api/applications with { jobId } and JWT in Authorization header.
3. verifyToken middleware verifies JWT and attaches req.user = { userId, role }.
4. authorizeRoles("student") ensures only students can proceed.
5. Controller verifies job exists and checks if application already exists for this (studentId, jobId).
6. New Application document is saved to MongoDB.
7. 201 Created response sent back to React UI.
8. React updates button state to "Applied ✓".
```

### Q9: How are duplicate applications prevented?
**Answer**: Through a two-layer defense:
1. **Controller check**: `Application.findOne({ studentId, jobId })` returns 400 Bad Request before attempting to insert.
2. **Database constraint**: Mongoose schema defines a compound unique index:
   `applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });`
   This guarantees that even with concurrent requests, MongoDB will reject duplicates with an `E11000` duplicate key error.

---

## 🧪 Demo User Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Recruiter** | `recruiter@google.com` | `Password123` |
| **Student** | `alice@university.edu` | `SecretPassword1` |

---

## 📤 Pushing to GitHub

To publish this project to your own GitHub repository:

1. Create a new repository on GitHub (e.g., `job-portal`).
2. Inside the `Job-portal` directory, initialize Git (if not already initialized):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Complete full-stack Job Portal project"
   ```
3. Link and push to your remote GitHub repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
*(Note: `.env` and `node_modules` are excluded by `.gitignore` to protect credentials).*

