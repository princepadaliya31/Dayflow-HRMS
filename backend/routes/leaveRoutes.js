import express from 'express';
import LeaveRequest from '../models/LeaveRequest.js';
import User from '../models/User.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all leave requests
// @route   GET /api/leaves
// @access  Private (Admin & HR)
router.get('/', protect, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const requests = await LeaveRequest.find({}).sort({ appliedOn: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get current user's leaves
// @route   GET /api/leaves/my-leaves
// @access  Private (Employee)
router.get('/my-leaves', protect, async (req, res) => {
  try {
    const requests = await LeaveRequest.find({ employeeId: req.user.employeeId }).sort({ appliedOn: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Apply for a leave
// @route   POST /api/leaves/apply
// @access  Private
router.post('/apply', protect, async (req, res) => {
  try {
    const { type, from, to, days, reason } = req.body;

    const request = new LeaveRequest({
      employeeId: req.user.employeeId,
      employeeName: req.user.name,
      department: req.user.department,
      type,
      from,
      to,
      days: Number(days),
      reason,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
    });

    const savedRequest = await request.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Approve/Reject a leave request
// @route   PUT /api/leaves/:id/status
// @access  Private (Admin & HR)
router.put('/:id/status', protect, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const request = await LeaveRequest.findById(req.params.id);

    if (request) {
      request.status = req.body.status; // 'approved' or 'rejected'
      const updatedRequest = await request.save();

      // If approved, update user status to 'on-leave' if the leave covers today's date
      if (request.status === 'approved') {
        const todayStr = new Date().toISOString().split('T')[0];
        if (todayStr >= request.from && todayStr <= request.to) {
          const user = await User.findOne({ employeeId: request.employeeId });
          if (user) {
            user.status = 'on-leave';
            await user.save();
          }
        }
      }

      res.json(updatedRequest);
    } else {
      res.status(404).json({ message: 'Leave request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
