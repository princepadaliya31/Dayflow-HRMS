import express from 'express';
import Payroll from '../models/Payroll.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get payroll records
// @route   GET /api/payroll
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let records;
    if (req.user.role === 'employee') {
      records = await Payroll.find({ employeeId: req.user.employeeId }).sort({ createdAt: -1 });
    } else {
      records = await Payroll.find({}).sort({ createdAt: -1 });
    }

    const users = await User.find({}).select('employeeId bankDetails');
    const bankMap = {};
    for (const u of users) {
      bankMap[u.employeeId] = u.bankDetails;
    }

    const recordsWithBank = records.map(rec => {
      const obj = rec.toObject();
      obj.bankDetails = bankMap[rec.employeeId] || {
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        accountHolderName: ''
      };
      return obj;
    });

    res.json(recordsWithBank);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Generate payroll for a month
// @route   POST /api/payroll/generate
// @access  Private (Admin & HR)
router.post('/generate', protect, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const { month } = req.body;
    if (!month) {
      return res.status(400).json({ message: 'Month is required' });
    }
    const [mName, yStr] = month.split(' ');
    const monthMap = {
      January: '01', February: '02', March: '03', April: '04',
      May: '05', June: '06', July: '07', August: '08',
      September: '09', October: '10', November: '11', December: '12'
    };
    const monthNum = monthMap[mName] || '06';
    const yearNum = yStr || '2026';

    const today = new Date();
    const currentMonthName = today.toLocaleString('default', { month: 'long' });
    const currentYearStr = today.getFullYear().toString();
    const isCurrentMonth = (mName === currentMonthName && yStr === currentYearStr);

    const employees = await User.find({ role: { $in: ['employee', 'hr'] } });
    const generatedRecords = [];

    for (const emp of employees) {
      // Check if already generated for this month
      const existing = await Payroll.findOne({ employeeId: emp.employeeId, month });
      if (existing) continue;

      // Find attendance records for this month
      const regexPattern = `^${yearNum}-${monthNum}`;
      const attendanceRecords = await Attendance.find({
        employeeId: emp.employeeId,
        date: { $regex: regexPattern }
      });

      let presentDaysCount = 0;
      for (const att of attendanceRecords) {
        if (att.status === 'present' || att.status === 'late') {
          presentDaysCount += 1;
        } else if (att.status === 'half-day') {
          presentDaysCount += 0.5;
        }
      }

      let ratio = 1.0;
      let presentDays = 30; // default full month display

      if (!isCurrentMonth) {
        // Only prorate for past completed months if they actually have check-in data,
        // otherwise default to full month (ratio = 1.0) so mock data stays beautiful
        if (attendanceRecords.length > 0) {
          presentDays = presentDaysCount;
          // Capped at 1.0 assuming a base of 22 working days
          ratio = Math.min(presentDaysCount / 22, 1.0);
        }
      }

      const basic = Math.round(emp.salary * 0.6 * ratio); // 60% basic
      const hra = Math.round(emp.salary * 0.24 * ratio);  // 24% HRA
      const allowances = Math.round(emp.salary * 0.16 * ratio); // 16% other allowances
      const deductions = Math.round(emp.salary * 0.05 * ratio); // 5% PF / deductions
      const tax = Math.round(emp.salary * 0.1 * ratio); // 10% TDS estimation
      const net = basic + hra + allowances - deductions - tax;

      const record = new Payroll({
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.department,
        month,
        baseSalary: emp.salary,
        presentDays,
        basic,
        hra,
        allowances,
        deductions,
        tax,
        net,
        status: 'pending',
      });

      const saved = await record.save();
      generatedRecords.push(saved);
    }

    res.status(201).json({
      message: `Successfully processed payroll for ${generatedRecords.length} employees`,
      records: generatedRecords,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update payroll payment status
// @route   PUT /api/payroll/:id/status
// @access  Private (Admin & HR)
router.put('/:id/status', protect, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const record = await Payroll.findById(req.params.id);

    if (record) {
      record.status = req.body.status; // 'paid' or 'processing' or 'pending'
      const updated = await record.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Payroll record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a payroll record (amount fields)
// @route   PUT /api/payroll/:id
// @access  Private (Admin & HR)
router.put('/:id', protect, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const record = await Payroll.findById(req.params.id);

    if (record) {
      const basic = Number(req.body.basic) || 0;
      const hra = Number(req.body.hra) || 0;
      const allowances = Number(req.body.allowances) || 0;
      const deductions = Number(req.body.deductions) || 0;
      const tax = Number(req.body.tax) || 0;
      
      record.basic = basic;
      record.hra = hra;
      record.allowances = allowances;
      record.deductions = deductions;
      record.tax = tax;
      record.net = basic + hra + allowances - deductions - tax;
      if (req.body.status) {
        record.status = req.body.status;
      }

      // Also update employee's bank details if they are sent in request body
      if (req.body.accountNumber !== undefined) {
        const emp = await User.findOne({ employeeId: record.employeeId });
        if (emp) {
          emp.bankDetails = {
            bankName: req.body.bankName || '',
            accountNumber: req.body.accountNumber || '',
            ifscCode: req.body.ifscCode || '',
            branchName: req.body.branchName || '',
            accountHolderName: req.body.accountHolderName || emp.name,
          };
          await emp.save();
        }
      }

      const updated = await record.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Payroll record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a payroll record
// @route   DELETE /api/payroll/:id
// @access  Private (Admin & HR)
router.delete('/:id', protect, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const record = await Payroll.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    await record.deleteOne();
    res.json({ message: 'Payroll record removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
