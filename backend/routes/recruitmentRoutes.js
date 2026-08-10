import express from 'express';
import Job from '../models/Job.js';
import Candidate from '../models/Candidate.js';
import User from '../models/User.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All recruitment routes require HR or Admin authorization
router.use(protect, authorizeRoles('admin', 'hr'));

// @desc    Get all job openings
// @route   GET /api/recruitment/jobs
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a job opening
// @route   POST /api/recruitment/jobs
router.post('/jobs', async (req, res) => {
  try {
    const { title, department, description, salaryRange, experience, openings } = req.body;
    
    if (!title || !department || !description) {
      return res.status(400).json({ message: 'Title, department, and description are required.' });
    }

    const job = await Job.create({
      title,
      department,
      description,
      salaryRange: salaryRange || '',
      experience: experience || '',
      openings: openings || 1,
      status: 'open',
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all candidates/applicants
// @route   GET /api/recruitment/candidates
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find({}).sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update candidate recruitment status
// @route   PUT /api/recruitment/candidates/:id/status
router.put('/candidates/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['applied', 'interviewing', 'shortlisted', 'hired', 'rejected'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid recruitment status value.' });
    }

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found.' });
    }

    candidate.status = status;
    const updatedCandidate = await candidate.save();
    res.json(updatedCandidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Hire candidate (converts applicant to employee in database)
// @route   POST /api/recruitment/candidates/:id/hire
router.post('/candidates/:id/hire', async (req, res) => {
  try {
    const { designation, department, salary, joinDate } = req.body;
    
    if (!designation || !department || !salary) {
      return res.status(400).json({ message: 'Designation, department, and salary are required to hire.' });
    }

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found.' });
    }

    // Check if email already registered as user
    const userExists = await User.findOne({ email: candidate.email });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this candidate\'s email is already registered.' });
    }

    // Auto-generate employeeId
    const lastUser = await User.findOne({ employeeId: /^E\d+$/ }).sort({ employeeId: -1 });
    let nextIdNumber = 11;
    if (lastUser && lastUser.employeeId) {
      const lastNum = parseInt(lastUser.employeeId.replace('E', ''), 10);
      if (!isNaN(lastNum)) {
        nextIdNumber = lastNum + 1;
      }
    }
    const actualEmpId = `E${String(nextIdNumber).padStart(3, '0')}`;

    // Create automatic initials avatar
    const initials = candidate.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    // Create the User document
    const newUser = await User.create({
      employeeId: actualEmpId,
      name: candidate.name,
      email: candidate.email,
      password: 'password123', // temporary default password
      role: 'employee',
      department,
      designation,
      status: 'active',
      phone: candidate.phone || '',
      avatar: initials,
      joinDate: joinDate || new Date().toLocaleDateString('en-CA'),
      salary: Number(salary) || 50000,
    });

    // Update candidate status to hired
    candidate.status = 'hired';
    await candidate.save();

    res.status(201).json({
      message: 'Candidate hired successfully as an active Employee!',
      employee: newUser,
      candidate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
