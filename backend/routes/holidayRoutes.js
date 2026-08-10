import express from 'express';
import Holiday from '../models/Holiday.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all holidays
// @route   GET /api/holidays
// @access  Private (All authenticated users)
router.get('/', protect, async (req, res) => {
  try {
    const holidays = await Holiday.find({}).sort({ date: 1 });
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new holiday
// @route   POST /api/holidays
// @access  Private (Admin only)
router.post('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const { title, date, type, description } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: 'Title and Date are required' });
    }

    const holiday = await Holiday.create({
      title,
      date,
      type: type || 'public',
      description: description || '',
    });

    res.status(201).json(holiday);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a holiday
// @route   DELETE /api/holidays/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.id);

    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    await holiday.deleteOne();
    res.json({ message: 'Holiday removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
