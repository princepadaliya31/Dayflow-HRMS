import express from 'express';
import Attendance from '../models/Attendance.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private (Admin & HR)
router.get('/', protect, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const records = await Attendance.find({}).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get current user's attendance records
// @route   GET /api/attendance/my-records
// @access  Private (Employee)
router.get('/my-records', protect, async (req, res) => {
  try {
    // req.user is populated by protect middleware
    const records = await Attendance.find({ employeeId: req.user.employeeId }).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Check-in for the day
// @route   POST /api/attendance/check-in
// @access  Private
router.post('/check-in', protect, async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-CA');
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0].slice(0, 5); // "HH:MM"

    // Check if record already exists
    let record = await Attendance.findOne({ employeeId: req.user.employeeId, date: today });

    if (record && record.checkIn !== '--') {
      return res.status(400).json({ message: 'You have already checked in for today' });
    }

    // Determine status (late if check-in is after 09:15 AM)
    const [hours, minutes] = timeString.split(':').map(Number);
    let status = 'present';
    if (hours > 9 || (hours === 9 && minutes > 15)) {
      status = 'late';
    }

    if (!record) {
      record = new Attendance({
        employeeId: req.user.employeeId,
        employeeName: req.user.name,
        department: req.user.department,
        date: today,
        checkIn: timeString,
        checkOut: '--',
        status,
        hours: 0,
      });
    } else {
      record.checkIn = timeString;
      record.status = status;
    }

    const savedRecord = await record.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Check-out for the day
// @route   POST /api/attendance/check-out
// @access  Private
router.post('/check-out', protect, async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-CA');
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0].slice(0, 5); // "HH:MM"

    const record = await Attendance.findOne({ employeeId: req.user.employeeId, date: today });

    if (!record || record.checkIn === '--') {
      return res.status(400).json({ message: 'You must check-in before checking out' });
    }

    if (record.checkOut !== '--') {
      return res.status(400).json({ message: 'You have already checked out for today' });
    }

    // Calculate hours worked
    const [inH, inM] = record.checkIn.split(':').map(Number);
    const [outH, outM] = timeString.split(':').map(Number);

    const checkInTime = new Date(today);
    checkInTime.setHours(inH, inM, 0);

    const checkOutTime = new Date(today);
    checkOutTime.setHours(outH, outM, 0);

    const differenceMs = checkOutTime - checkInTime;
    const hours = Math.round((differenceMs / (1000 * 60 * 60)) * 100) / 100;

    record.checkOut = timeString;
    record.hours = hours > 0 ? hours : 0;

    // Optional status update (half-day if less than 5 hours)
    if (record.hours < 5 && record.hours > 0) {
      record.status = 'half-day';
    }

    const savedRecord = await record.save();
    res.json(savedRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
