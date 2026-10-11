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

## 🧪 Demo User Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Recruiter** | `recruiter@google.com` | `Password123` |
| **Student** | `alice@university.edu` | `SecretPassword1` |

