# 💼 Dayflow - HRMS & Attendance Management System

A comprehensive, production-ready **Human Resource Management and Attendance System** built with **Node.js (Express)**, **React (TypeScript + Vite)**, and **MongoDB**. The project provides a premium, responsive workflow for clock actions, leave applications, payroll cost analysis, recruitment desks, and visual reports.

🚀 **Live Demo**: [dayflow-hrms-blue.vercel.app](https://dayflow-hrms-blue.vercel.app/)

🌐 **Deployment Hosting**:
* **Frontend**: Vercel
* **Backend**: Render
* **Database**: MongoDB Atlas (Cloud)

---

## 🌟 Key Features

### 🔐 Authentication & Authorization
- Secure JWT-based authentication with BCrypt password hashing.
- Role-Based Access Control (RBAC):
  - **EMPLOYEE:** Clock attendance, apply for leaves, track payroll costing slips, and modify bank/personal info.
  - **HR MANAGER:** Onboard staff, manage candidates, approve leaves, schedule holiday events, and extract reports.
  - **ADMIN:** Complete dashboard syncs, organization analytics, and database monitoring.
- Dynamic error banners that instantly clear as soon as the user starts typing.
- Forgot Password flow with Nodemailer-dispatched 6-digit OTP codes expiring in 3 minutes.

### ⏰ Timezone-Aware Attendance Logging
- Daily check-in, check-out, and break management logs.
- Timezone offset alignment (`toLocaleDateString('en-CA')`) preventing shifts for late-night or early-morning clock logs.
- Weekly work hours charts mapping active preparation hours from Monday to Friday.

### 📄 Leaves and Holiday Events
- Single-page application calendar displaying public holidays and events as colored inline strips.
- Leave application portal with real-time approval status badges.

### 📈 Recruitment & Interactive Reports
- Full recruitment board: post open jobs, track candidate applications, and convert hired candidates into user accounts automatically.
- Custom report dashboard with real-time filters and Excel/CSV exporters formatted to prevent date display errors.

---

## 🏗️ System Architecture

┌────────────────────────────────────┐
│      Frontend (React + Vite)       │
│  Context API • TypeScript • Axios  │
└────────────────┬───────────────────┘
                 │ HTTPS / REST API
                 ▼
┌────────────────────────────────────┐
│         Express JWT Filter         │
│ Authentication & Token Verification│
└────────────────┬───────────────────┘
                 ▼
┌────────────────────────────────────┐
│         REST Api Routers           │
└────────────────┬───────────────────┘
                 ▼
┌────────────────────────────────────┐
│         Controllers / Hooks        │
│   Business Validation & Logic      │
└────────────────┬───────────────────┘
                 ▼
┌────────────────────────────────────┐
│       MongoDB Mongoose Schemas     │
└────────────────┬───────────────────┘
                 ▼
┌────────────────────────────────────┐
│      MongoDB Atlas / Local DB      │
└────────────────────────────────────┘

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS, Recharts, Lucide Icons, React Router DOM v6
- **Backend:** Node.js, Express, Mongoose, JSON Web Tokens (JWT), BcryptJS, Nodemailer
- **Database:** MongoDB Atlas (Cloud) / MongoDB Community Server (Local)
- **Deployment:** Vercel (Frontend), Render (Backend), MongoDB Atlas (Cloud Database)

---

## 📂 Project Structure

```text
Dayflow-HRMS
├── backend
│   ├── config/                 # Database configuration
│   ├── middleware/             # Route protection middleware
│   ├── models/                 # Mongoose collection models
│   ├── routes/                 # API controllers and endpoint handlers
│   ├── scripts/                # Database seed script
│   ├── server.js               # Application entry point
│   └── package.json
│
└── frontend
    ├── src/components/         # Reusable dashboard widgets
    ├── src/context/            # Global Auth Context and Reducers
    ├── src/layouts/            # Role workspace frame layouts
    ├── src/pages/              # Role views (Admin, HR, Employee)
    ├── src/utils/              # API Client helpers
    ├── package.json
    └── vite.config.ts
```

---

## 🔗 Important APIs

| Method | Endpoint | Description |
|:---:|:---|:---|
| **POST** | `/api/auth/register` | Register New User Profile |
| **POST** | `/api/auth/login` | User Authentication (Returns JWT & user data) |
| **PUT** | `/api/auth/profile` | Update User Name, Email, Phone |
| **PUT** | `/api/auth/profile/password` | Update Hashed Security Password |
| **POST** | `/api/auth/forgot-password` | Generate and Email Password Reset OTP |
| **POST** | `/api/auth/verify-otp` | Verify 6-digit numeric recovery OTP |
| **POST** | `/api/auth/reset-password` | Save New Password after verification |
| **POST** | `/api/attendance/check-in` | Log check-in action |
| **POST** | `/api/attendance/break-start` | Go on active break |
| **POST** | `/api/attendance/break-end` | End break and resume work |
| **POST** | `/api/attendance/check-out` | Log check-out action |
| **POST** | `/api/leaves` | Apply for Leave (Employee) |
| **PUT** | `/api/leaves/{id}/status` | Approve or Reject Leave Request (HR/Admin) |
| **POST** | `/api/recruitment/jobs` | Post a New Job opening |
| **POST** | `/api/recruitment/candidates` | Register Candidate to Job opening |
| **POST** | `/api/recruitment/candidates/{id}/hire` | Convert hired candidate into active Employee user |

---

## 🛠️ Tech Stack & Dependencies

### Frontend
- **Core:** React 19, TypeScript, Vite 8
- **Styling:** Tailwind CSS, PostCSS, Lucide React
- **Data Visualization:** Recharts (weekly analytics)
- **Routing:** React Router DOM v6

### Backend
- **Core:** Node.js, Express.js
- **Security:** BcryptJS, jsonwebtoken
- **Mail:** Nodemailer SMTP integration
- **Database ORM:** Mongoose & MongoDB

---

## 🚀 Local Setup & Running Guide

### Prerequisites
* **Node.js** (v18+ recommended) and **npm**.
* **MongoDB** (Ensure MongoDB is running locally on port `27017` or use MongoDB Atlas).

---

### 1. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create/update the `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/dayflow-hrms
   JWT_SECRET=your_jwt_signing_key_here
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   
   # SMTP mail config for OTP resets (Gmail Example)
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password
   SMTP_FROM_NAME=Dayflow HRMS
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Seed the database with initial demo roles and records:
   ```bash
   npm run db:seed
   ```

5. Launch the backend server:
   ```bash
   npm run dev
   ```
   The backend will start and listen on port **`5000`**.

---

### 2. Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will start and be available at **`http://localhost:5173`**.

---

### 🔑 Test Credentials (Admin, HR & Employee)

The application seeds a default database. You can log in using the following accounts:

* **Administrator Account**:
  * **Email**: `admin@gmail.com`
  * **Password**: `admin123`
* **HR Manager Account**:
  * **Email**: `hr@gmail.com`
  * **Password**: `HR@123`
* **Regular Employee Account**:
  * **Email**: `employee@gmail.com`
  * **Password**: `Emp@123`

---

## 🧪 Verification & Build Status

The application build validation suite ensures that the frontend and backend interact seamlessly.

| Step | Metric | Status |
|---|---|---|
| 1 | Mongoose Database Seeds | ✅ 100% Loaded |
| 2 | REST Endpoints Validation | ✅ Passed |
| 3 | Frontend Build Verification | ✅ Vite Compiled Successfully |
| 4 | JWT Auth Filter Validation | ✅ Protected Routes Active |
| 5 | Build Status | ✅ SUCCESS |

---

## 🤖 My AI Usage

During the development of this project, I paired with **Antigravity**, a Google DeepMind agentic coding assistant, to accelerate delivery and maintain clean code standards:

1. **Architecture & Database Schema**:
   * Designed decoupled MongoDB schemas mapping user accounts, candidate status steps, attendance check-ins, leave applications, and holiday events.
2. **Security & Validation Flows**:
   * Programmed JWT-based authorization and Bcrypt verification endpoints.
   * Integrated local timezone logic (`toLocaleDateString('en-CA')`) to safeguard attendance log calculations.
   * Connected Nodemailer to generate secure 3-minute OTP verification codes.
3. **Frontend Dashboard Views**:
   * Implemented React state handlers and functional closures (`setUser(prev => ...)`) to eliminate race conditions.
   * Tailored Tailwind CSS classes for premium glassmorphism layouts and responsive weekly charts.
4. **Interactive Reports & CSV Exports**:
   * Formatted report generators to automatically prepended spaces to CSV numerical dates, avoiding Excel width parsing errors.
