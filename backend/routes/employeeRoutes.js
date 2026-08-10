import express from 'express';
import User from '../models/User.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (Admin & HR)
router.get('/', protect, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'hr') {
      // Exclude admin users and pending users who requested the 'hr' role
      query = {
        role: { $ne: 'admin' },
        $or: [
          { status: { $ne: 'pending' } },
          { role: { $ne: 'hr' } }
        ]
      };
    } else {
      // Exclude admin users for admin as well
      query = {
        role: { $ne: 'admin' }
      };
    }
    const employees = await User.find(query).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add a new employee
// @route   POST /api/employees
// @access  Private (Admin & HR)
router.post('/', protect, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const { name, email, department, designation, salary, phone, joinDate, status } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate unique employee ID (find count to increment)
    const count = await User.countDocuments();
    const employeeId = `E${String(count + 1).padStart(3, '0')}`;

    // Get initials for avatar
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const employee = await User.create({
      employeeId,
      name,
      email,
      password: 'password123', // Default temporary login password
      role: 'employee',
      department: department || 'General',
      designation: designation || 'Staff Member',
      salary: salary || 30000,
      phone: phone || '',
      avatar: initials,
      joinDate: joinDate || new Date().toISOString().split('T')[0],
      status: status || 'active',
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private (Admin & HR)
router.put('/:id', protect, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const employee = await User.findOne({ employeeId: req.params.id });

    if (employee) {
      employee.name = req.body.name || employee.name;
      employee.email = req.body.email || employee.email;
      employee.department = req.body.department || employee.department;
      employee.designation = req.body.designation || employee.designation;
      employee.salary = req.body.salary !== undefined ? req.body.salary : employee.salary;
      employee.phone = req.body.phone || employee.phone;
      employee.status = req.body.status || employee.status;
      employee.joinDate = req.body.joinDate || employee.joinDate;

      // Update initials avatar if name changes
      if (req.body.name) {
        employee.avatar = req.body.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
      }

      const updatedEmployee = await employee.save();
      res.json(updatedEmployee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin)
router.delete('/:id', protect, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const employee = await User.findOne({ employeeId: req.params.id });

    if (employee) {
      await employee.deleteOne();
      res.json({ message: 'Employee removed successfully' });
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
