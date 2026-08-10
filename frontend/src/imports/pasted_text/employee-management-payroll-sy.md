Frontend Development Prompt - Employee Management & Payroll System (3 Roles)

Build a production-ready frontend application for an Employee Management & Payroll System (HRMS) using:

Tech Stack

React.js

TypeScript

Vite

Tailwind CSS

Redux Toolkit

React Router DOM

Axios

React Query

React Hook Form

Chart.js

React Hot Toast

Framer Motion

Recharts

Socket.IO Client

General Requirements

UI Requirements

Create a modern enterprise dashboard similar to:

Zoho People

BambooHR

Keka

Workday

Features

Fully Responsive

Dark / Light Theme

Sidebar Navigation

Breadcrumb Navigation

Loading Skeletons

Error Pages

Empty States

Toast Notifications

Reusable Components

TypeScript Strict Mode

Clean Architecture

Folder Structure

client/

src/

├── assets/
├── components/
│
│── common/
│── ui/
│── forms/
│── tables/
│── charts/
│── modals/
│── cards/
│── notifications/
│
├── pages/
│
│── auth/
│── admin/
│── hr/
│── employee/
│
├── layouts/
│
│── AdminLayout.tsx
│── HRLayout.tsx
│── EmployeeLayout.tsx
│── AuthLayout.tsx
│
├── routes/
│
│── AppRoutes.tsx
│── ProtectedRoute.tsx
│── RoleRoute.tsx
│
├── redux/
│
│── store.ts
│── slices/
│── api/
│
├── hooks/
├── services/
├── constants/
├── context/
├── utils/
├── types/
├── schemas/
├── config/
├── styles/
│
├── App.tsx
└── main.tsx


Authentication Module

Create pages:

pages/auth/

Login.tsx
Register.tsx
ForgotPassword.tsx
ResetPassword.tsx
VerifyEmail.tsx
ChangePassword.tsx


Features

Form Validation

JWT Authentication

Refresh Token Handling

Remember Me

Password Visibility Toggle

Email Verification Screen

Loading States

Error Handling

Protected Routes

Common Components

Create reusable components:

components/ui/

Button
Input
Textarea
Select
MultiSelect
DatePicker
Modal
Drawer
Badge
Avatar
Card
Table
Pagination
SearchBar
FileUploader
Calendar
Loader
Skeleton
StatsCard
ChartCard


ADMIN ROLE

Admin Layout

Create:

layouts/AdminLayout.tsx


Features:

Sidebar

Header

Notifications Dropdown

User Profile Dropdown

Theme Switcher

Breadcrumb

Admin Pages

pages/admin/

Dashboard.tsx
Employees.tsx
EmployeeDetails.tsx
CreateEmployee.tsx
EditEmployee.tsx

Departments.tsx

Attendance.tsx

Leaves.tsx

Payroll.tsx
GeneratePayroll.tsx
PayslipViewer.tsx

Performance.tsx

Holidays.tsx

Notifications.tsx

Analytics.tsx

AuditLogs.tsx

Settings.tsx


Admin Dashboard Widgets

Cards:

Total Employees

Present Today

Absent Today

Pending Leaves

Payroll Expenses

New Employees

Charts:

Attendance Analytics

Salary Analytics

Department Distribution

Employee Growth

Leave Statistics

Employee Management Module

Features:

Employee Table

Search

Filters

Pagination

Add Employee Modal

Edit Employee Modal

Delete Confirmation Modal

Profile Image Upload

Document Upload

Employee Details Page:

Personal Information

Employment Information

Bank Information

Documents

Payroll History

Attendance History

Performance Reviews

Department Management

Features:

Department CRUD

Manager Assignment

Employee Count

Department Statistics

Attendance Management

Features:

Daily Attendance Table

Monthly Reports

Date Filters

Export Excel

Export PDF

Leave Management

Features:

Leave Requests Table

Approve Modal

Reject Modal

Leave Statistics

Payroll Management

Features:

Generate Payroll

Salary Breakdown

Payslip Preview

Download PDF

Email Payslip

Holiday Management

Features:

Holiday Calendar

Add Holiday

Edit Holiday

Delete Holiday

Notifications

Features:

Company Announcements

System Notifications

Real-Time Notifications

Analytics

Features:

Dashboard Charts

Download Reports

Filters

HR ROLE

HR Layout

layouts/HRLayout.tsx


HR Pages

pages/hr/

Dashboard.tsx

Employees.tsx
EmployeeDetails.tsx

Attendance.tsx

Leaves.tsx

Payroll.tsx

Performance.tsx

Notifications.tsx

Reports.tsx


HR Dashboard Widgets

Cards:

Total Employees

Pending Leaves

Today's Attendance

Performance Reviews

Charts:

Attendance Analytics

Employee Distribution

Leave Analytics

HR Features

Employee Management

Add Employee

Edit Employee

Verify Documents

View Employee Profile

Attendance

Attendance Reports

Filters

Leave

Approve Leave

Reject Leave

Add Comments

Payroll

Generate Payslips

View Salary History

Performance

Add Ratings

Add Goals

Promotion Recommendation

EMPLOYEE ROLE

Employee Layout

layouts/EmployeeLayout.tsx


Employee Pages

pages/employee/

Dashboard.tsx

Profile.tsx

Attendance.tsx

Leaves.tsx

Payroll.tsx

Performance.tsx

Notifications.tsx

HolidayCalendar.tsx

Settings.tsx


Employee Dashboard Widgets

Cards:

Today's Attendance

Leave Balance

Upcoming Holidays

Salary Summary

Performance Rating

Widgets:

Notifications

Announcements

Calendar

Quick Actions

Employee Features

Profile

Features:

Update Personal Details

Update Address

Update Bank Details

Upload Profile Image

Upload Documents

Attendance

Features:

Clock In

Clock Out

Attendance Calendar

Monthly Attendance

Leave

Features:

Apply Leave

Upload Medical Certificate

View Leave History

Track Leave Status

Payroll

Features:

Salary History

Download Payslip PDF

Performance

Features:

View Ratings

View Goals

View Feedback

Holiday Calendar

Features:

Public Holidays

Festivals

Company Holidays

Redux Structure

redux/

store.ts

slices/

authSlice.ts
userSlice.ts
employeeSlice.ts
attendanceSlice.ts
leaveSlice.ts
payrollSlice.ts
performanceSlice.ts
departmentSlice.ts
holidaySlice.ts
notificationSlice.ts
dashboardSlice.ts
themeSlice.ts


Services Structure

services/

authService.ts
employeeService.ts
attendanceService.ts
leaveService.ts
payrollService.ts
departmentService.ts
holidayService.ts
performanceService.ts
notificationService.ts
dashboardService.ts
uploadService.ts


Hooks

hooks/

useAuth.ts
usePermissions.ts
usePagination.ts
useDebounce.ts
useSocket.ts
useTheme.ts


Type Definitions

types/

auth.types.ts
user.types.ts
employee.types.ts
attendance.types.ts
leave.types.ts
payroll.types.ts
performance.types.ts
department.types.ts
holiday.types.ts
notification.types.ts
dashboard.types.ts
api.types.ts


Validation Schemas

schemas/

login.schema.ts
employee.schema.ts
leave.schema.ts
payroll.schema.ts
department.schema.ts
profile.schema.ts


Routing Structure

routes/

AppRoutes.tsx
ProtectedRoute.tsx
AdminRoute.tsx
HRRoute.tsx
EmployeeRoute.tsx


Required Features

Role Based Routing

JWT Token Management

Refresh Token Handling

Axios Interceptors

API Error Handling

React Query Caching

Form Validation

Lazy Loading

Code Splitting

Real-Time Notifications

Theme Switching

File Upload Support

Responsive Design

Accessibility Support

Production Ready Folder Structure

Generate:

Complete frontend architecture.

All pages for Admin, HR, and Employee roles.

Redux store and slices.

Reusable components.

TypeScript interfaces.

API service layer.

Protected routes.

Responsive dashboard UI.

Form validations.

Complete file structure with implementation-ready code.
using this data give me proper implement frontend like mordern and something new but simple degine