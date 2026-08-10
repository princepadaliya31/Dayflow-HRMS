import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Models
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Payroll from '../models/Payroll.js';
import Department from '../models/Department.js';
import Notification from '../models/Notification.js';
import Job from '../models/Job.js';
import Candidate from '../models/Candidate.js';

const mockEmployees = [
  { employeeId: 'E001', name: 'Arjun Mehta', email: 'employee@gmail.com', department: 'Engineering', designation: 'Senior Engineer', status: 'active', avatar: 'AM', joinDate: '2021-03-15', salary: 125000, phone: '+91 98765 43210', role: 'employee' },
  { employeeId: 'E002', name: 'Priya Sharma', email: 'priya.sharma@gmail.com', department: 'Design', designation: 'UX Lead', status: 'active', avatar: 'PS', joinDate: '2020-07-22', salary: 110000, phone: '+91 98765 43211', role: 'employee' },
  { employeeId: 'E003', name: 'Rohan Das', email: 'rohan.das@gmail.com', department: 'Marketing', designation: 'Marketing Manager', status: 'on-leave', avatar: 'RD', joinDate: '2019-11-01', salary: 95000, phone: '+91 98765 43212', role: 'employee' },
  { employeeId: 'E004', name: 'Sneha Patel', email: 'sneha.patel@gmail.com', department: 'Engineering', designation: 'Frontend Dev', status: 'active', avatar: 'SP', joinDate: '2022-01-10', salary: 85000, phone: '+91 98765 43213', role: 'employee' },
  { employeeId: 'E005', name: 'Vikram Singh', email: 'vikram.singh@gmail.com', department: 'Sales', designation: 'Sales Executive', status: 'active', avatar: 'VS', joinDate: '2022-06-20', salary: 78000, phone: '+91 98765 43214', role: 'employee' },
  { employeeId: 'E006', name: 'Rajesh Kumar', email: 'hr@gmail.com', department: 'HR', designation: 'HR Specialist', status: 'active', avatar: 'RK', joinDate: '2021-09-05', salary: 82000, phone: '+91 98765 43215', role: 'hr' },
  { employeeId: 'E007', name: 'Kabir Nair', email: 'kabir.nair@gmail.com', department: 'Finance', designation: 'Finance Analyst', status: 'active', avatar: 'KN', joinDate: '2020-04-18', salary: 98000, phone: '+91 98765 43216', role: 'employee' },
  { employeeId: 'E008', name: 'Meera Joshi', email: 'meera.joshi@gmail.com', department: 'Design', designation: 'Visual Designer', status: 'inactive', avatar: 'MJ', joinDate: '2023-02-14', salary: 72000, phone: '+91 98765 43217', role: 'employee' },
  { employeeId: 'E009', name: 'Aditya Kumar', email: 'aditya.kumar@gmail.com', department: 'Engineering', designation: 'Backend Dev', status: 'active', avatar: 'AK', joinDate: '2021-12-01', salary: 105000, phone: '+91 98765 43218', role: 'employee' },
  { employeeId: 'E010', name: 'Ritu Verma', email: 'ritu.verma@gmail.com', department: 'Operations', designation: 'Ops Manager', status: 'active', avatar: 'RV', joinDate: '2019-06-30', salary: 115000, phone: '+91 98765 43219', role: 'employee' },
];

const mockAttendance = [
  { employeeId: 'E001', employeeName: 'Arjun Mehta', department: 'Engineering', date: '2026-07-13', checkIn: '09:02', checkOut: '18:15', status: 'present', hours: 9.2 },
  { employeeId: 'E002', employeeName: 'Priya Sharma', department: 'Design', date: '2026-07-13', checkIn: '09:45', checkOut: '18:00', status: 'late', hours: 8.25 },
  { employeeId: 'E003', employeeName: 'Rohan Das', department: 'Marketing', date: '2026-07-13', checkIn: '--', checkOut: '--', status: 'absent', hours: 0 },
  { employeeId: 'E004', employeeName: 'Sneha Patel', department: 'Engineering', date: '2026-07-13', checkIn: '08:55', checkOut: '17:55', status: 'present', hours: 9.0 },
  { employeeId: 'E005', employeeName: 'Vikram Singh', department: 'Sales', date: '2026-07-13', checkIn: '09:00', checkOut: '13:30', status: 'half-day', hours: 4.5 },
  { employeeId: 'E006', employeeName: 'Ananya Roy', department: 'HR', date: '2026-07-13', checkIn: '08:50', checkOut: '18:10', status: 'present', hours: 9.33 },
  { employeeId: 'E007', employeeName: 'Kabir Nair', department: 'Finance', date: '2026-07-13', checkIn: '09:05', checkOut: '18:05', status: 'present', hours: 9.0 },
  { employeeId: 'E009', employeeName: 'Aditya Kumar', department: 'Engineering', date: '2026-07-13', checkIn: '09:30', checkOut: '18:30', status: 'late', hours: 9.0 },
];

const mockLeaves = [
  { employeeId: 'E003', employeeName: 'Rohan Das', department: 'Marketing', type: 'sick', from: '2026-07-10', to: '2026-07-14', days: 5, reason: 'Fever and flu', status: 'approved', appliedOn: '2026-07-09' },
  { employeeId: 'E005', employeeName: 'Vikram Singh', department: 'Sales', type: 'casual', from: '2026-07-20', to: '2026-07-21', days: 2, reason: 'Family function', status: 'pending', appliedOn: '2026-07-12' },
  { employeeId: 'E001', employeeName: 'Arjun Mehta', department: 'Engineering', type: 'annual', from: '2026-08-01', to: '2026-08-07', days: 7, reason: 'Vacation', status: 'pending', appliedOn: '2026-07-11' },
  { employeeId: 'E004', employeeName: 'Sneha Patel', department: 'Engineering', type: 'sick', from: '2026-07-08', to: '2026-07-09', days: 2, reason: 'Doctor visit', status: 'approved', appliedOn: '2026-07-07' },
  { employeeId: 'E009', employeeName: 'Aditya Kumar', department: 'Engineering', type: 'casual', from: '2026-07-18', to: '2026-07-18', days: 1, reason: 'Personal work', status: 'rejected', appliedOn: '2026-07-10' },
];

const mockPayroll = [
  { employeeId: 'E001', employeeName: 'Arjun Mehta', department: 'Engineering', month: 'June 2026', basic: 75000, hra: 30000, allowances: 12000, deductions: 5000, tax: 12800, net: 99200, status: 'paid' },
  { employeeId: 'E002', employeeName: 'Priya Sharma', department: 'Design', month: 'June 2026', basic: 66000, hra: 26400, allowances: 10000, deductions: 4500, tax: 10400, net: 87500, status: 'paid' },
  { employeeId: 'E007', employeeName: 'Kabir Nair', department: 'Finance', month: 'June 2026', basic: 58800, hra: 23520, allowances: 9000, deductions: 4000, tax: 9200, net: 78120, status: 'paid' },
  { employeeId: 'E009', employeeName: 'Aditya Kumar', department: 'Engineering', month: 'June 2026', basic: 63000, hra: 25200, allowances: 11000, deductions: 4200, tax: 10800, net: 84200, status: 'pending' },
  { employeeId: 'E010', employeeName: 'Ritu Verma', department: 'Operations', month: 'June 2026', basic: 69000, hra: 27600, allowances: 10500, deductions: 4800, tax: 11500, net: 90800, status: 'paid' },
];

const mockDepartments = [
  { name: 'Engineering', manager: 'Arjun Mehta', headCount: 28, budget: 3200000 },
  { name: 'Design', manager: 'Priya Sharma', headCount: 12, budget: 1400000 },
  { name: 'Marketing', manager: 'Rohan Das', headCount: 15, budget: 1800000 },
  { name: 'Sales', manager: 'Vikram Singh', headCount: 22, budget: 2100000 },
  { name: 'Finance', manager: 'Kabir Nair', headCount: 9, budget: 980000 },
  { name: 'HR', manager: 'Ananya Roy', headCount: 7, budget: 750000 },
  { name: 'Operations', manager: 'Ritu Verma', headCount: 18, budget: 2000000 },
];

const mockNotifications = [
  { title: 'Leave Request', message: 'Vikram Singh applied for 2 days casual leave', time: '2 hours ago', read: false, type: 'info' },
  { title: 'Payroll Processed', message: 'June 2026 payroll has been successfully processed', time: '5 hours ago', read: false, type: 'success' },
  { title: 'New Employee', message: 'Welcome onboard — Meera Joshi joined Design team', time: '1 day ago', read: true, type: 'success' },
  { title: 'Attendance Alert', message: '3 employees marked absent today without leave', time: '1 day ago', read: true, type: 'warning' },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dayflow-hrms';
    console.log(`Connecting to MongoDB for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    // Drop existing database to clear stale indexes and collections
    console.log('Dropping existing database for clean slate...');
    await mongoose.connection.db.dropDatabase();

    // 1. Create Admin User
    console.log('Seeding admin accounts...');
    await User.create({
      employeeId: 'E000',
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin',
      designation: 'HR Administrator',
      department: 'HR',
      status: 'active',
      avatar: 'AU',
      joinDate: '2019-01-01',
      salary: 200000,
      phone: '+91 99999 99999',
    });

    // 2. Create Employees / HR users
    console.log('Seeding employees...');
    for (const emp of mockEmployees) {
      let password = 'password123';
      if (emp.role === 'hr') password = 'HR@123';
      else if (emp.role === 'employee' && emp.email === 'employee@gmail.com') password = 'Emp@123';
      
      await User.create({
        ...emp,
        password,
      });
    }

    // 3. Seed Attendance records
    console.log('Seeding attendance log...');
    await Attendance.insertMany(mockAttendance);

    // 4. Seed Leave requests
    console.log('Seeding leaves...');
    await LeaveRequest.insertMany(mockLeaves);

    // 5. Seed Payroll
    console.log('Seeding payroll calculations...');
    await Payroll.insertMany(mockPayroll);

    // 6. Seed Departments
    console.log('Seeding departments...');
    await Department.insertMany(mockDepartments);

    // 7. Seed Notifications
    console.log('Seeding notifications...');
    await Notification.insertMany(mockNotifications);

    // 8. Seed Recruitment (Jobs & Candidates)
    console.log('Seeding recruitment jobs and applicants...');
    await Job.deleteMany({});
    await Candidate.deleteMany({});

    const job1 = await Job.create({
      title: 'Senior Frontend Dev (React)',
      department: 'Engineering',
      description: 'We are looking for a Senior React Engineer with 5+ years of experience building beautiful dashboards and high-performance apps.',
      salaryRange: '₹12,00,000 - ₹18,00,000 PA',
      experience: '5-8 Years',
      status: 'open',
      openings: 2
    });

    const job2 = await Job.create({
      title: 'Visual UI Designer',
      department: 'Design',
      description: 'Join our design crew to create premium aesthetics, smooth animations, and top-tier user experiences.',
      salaryRange: '₹8,0,000 - ₹12,0,000 PA',
      experience: '2-4 Years',
      status: 'open',
      openings: 1
    });

    const job3 = await Job.create({
      title: 'HR Executive',
      department: 'HR',
      description: 'Manage onboarding, talent acquisition, and employee engagement activities.',
      salaryRange: '₹5,0,000 - ₹8,0,000 PA',
      experience: '1-3 Years',
      status: 'closed',
      openings: 1
    });

    await Candidate.create({
      name: 'Vikas Sharma',
      email: 'vikas.sharma@gmail.com',
      phone: '+91 98888 77777',
      jobId: job1._id,
      jobTitle: job1.title,
      experience: '6 Years',
      status: 'interviewing',
      appliedDate: '2026-08-01',
      resumeSummary: 'Expert in React, TypeScript, TailwindCSS, and state management frameworks. Built 4 large-scale enterprise SaaS portals.'
    });

    await Candidate.create({
      name: 'Nisha Goel',
      email: 'nisha.goel@gmail.com',
      phone: '+91 97777 66666',
      jobId: job2._id,
      jobTitle: job2.title,
      experience: '3 Years',
      status: 'applied',
      appliedDate: '2026-08-04',
      resumeSummary: 'Figma and Adobe Creative Suite wizard. Specialized in dashboard design systems and micro-interactions.'
    });

    await Candidate.create({
      name: 'Amit Patel',
      email: 'amit.patel@gmail.com',
      phone: '+91 96666 55555',
      jobId: job1._id,
      jobTitle: job1.title,
      experience: '4 Years',
      status: 'rejected',
      appliedDate: '2026-07-28',
      resumeSummary: 'Frontend developer with background in React and Vue. Strong communication skills.'
    });

    console.log('Database successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
