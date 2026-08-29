# CareerLink — Professional Networking & Recruitment Platform

> **"Connect. Grow. Get Hired."**

CareerLink is a modern, full-stack professional networking and talent recruitment web platform inspired by the professional ecosystem of modern careers. It features real persistence, role-based workflows (Candidate, Recruiter, Admin), an ATS applicant tracking pipeline, a deterministic 100-point job recommendation engine, real-time messaging, long-form articles, and comprehensive skill endorsement graphs.

---

## 🚀 Key Features

### 1. Professional Profiles & Resume System
- Comprehensive career profiles with avatars, cover headers, headline, bio, experience timeline, education history, licenses & certifications, and portfolio projects.
- **Resume Management**: Upload, preview via in-browser PDF modal, download, and delete resumes.
- **Skill Endorsements**: Star counters (`★ 24 endorsements`) with strict duplicate prevention.

### 2. Deterministic Algorithmic Job Recommendation Engine
- Computes an exact 0–100% match score using a weighted 6-factor model:
  - **Skills Match**: 40%
  - **Experience Match**: 20%
  - **Title / Target Role Similarity**: 15%
  - **Education Match**: 10%
  - **Location Match**: 10%
  - **Work Mode Preference**: 5%
- Transparent scoring breakdown modal with itemized checkmarks explaining exactly why the candidate matched each position.

### 3. Recruiter ATS Pipeline & Talent Sourcing
- **Recruiter Mission Control**: Real-time hiring funnel metrics (Total Jobs, Active Roles, Total Applicants, Interview Stages, Hired).
- **Interactive 6-Stage ATS Pipeline**: Progress candidates through `Applied` → `Under Review` → `Shortlisted` → `Interview` → `Selected` → `Rejected` with automated candidate status notifications.
- **Candidate Discovery Engine**: Filter candidate pool by Name, Skill, Education, Experience years, Location, and Target Role.

### 4. 1-to-1 Real-Time Messaging & Networking
- One-to-one messaging restricted to connected peers.
- Powered by Socket.IO with real-time delivery, message timestamps, unread count badges, and notifications.
- Connection graph: send, accept, ignore, withdraw, and disconnect with suggested peers.

### 5. Community Feed, Articles & Verified Companies
- Interactive feed with post authoring (media, links, text), like toggles, expandable comments drawer, and bookmarking.
- Long-form markdown thought leadership article publisher and reader.
- Verified fictional tech companies (**NovaTech Systems**, **CloudSphere Technologies**, **ByteWorks Studio**, **Finova Capital**, **TechCore Solutions**).

---

## 🛠 Tech Stack

- **Frontend**: React.js 18, Vite, Tailwind CSS, Framer Motion, React Router v6, Axios, Lucide Icons, Date-fns, Socket.io-client.
- **Backend**: Node.js, Express.js, Socket.IO, JWT, bcryptjs, Multer.
- **Database**: MongoDB & Mongoose (with seamless local in-memory fallback for immediate zero-config development/testing).

---

## ⚡ Getting Started

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Run Database Seed (Optional)
```bash
npm run seed
```

### 3. Start Development Servers
```bash
npm run dev
```
- **Client App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 👥 Demo Accounts

| Persona | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Candidate (Senior Full Stack)** | `alex.rivera@example.com` | `password123` | `candidate` |
| **Candidate (AI/ML Engineer)** | `priya.sharma@example.com` | `password123` | `candidate` |
| **Recruiter (NovaTech Systems)** | `elena.rostova@example.com` | `password123` | `recruiter` |
| **Recruiter (CloudSphere Tech)** | `jason.reid@example.com` | `password123` | `recruiter` |
| **Platform Administrator** | `admin@careerlink.io` | `password123` | `admin` |

*Note: You can also use the **"Demo Accounts" 1-click switcher** directly in the top-right of the navigation bar.*
