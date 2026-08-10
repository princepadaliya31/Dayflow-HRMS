import express from 'express';
import Department from '../models/Department.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const departments = await Department.find({});
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create department
// @route   POST /api/departments
// @access  Private (Admin)
router.post('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, manager, budget } = req.body;

    const exists = await Department.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    const dept = await Department.create({
      name,
      manager: manager || '',
      budget: budget || 0,
      headCount: 0,
    });

    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
