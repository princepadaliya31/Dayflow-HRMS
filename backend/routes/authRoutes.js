import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/authMiddleware.js';
import nodemailer from 'nodemailer';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dayflow_secret_key_987654321_jwt_auth', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (employee or hr)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, phone, employeeId } = req.body;

    const requestedRole = role || 'employee';

    // Prevent registering Admin accounts publicly
    if (requestedRole === 'admin') {
      await Notification.create({
        title: 'Registration Alert',
        message: `Blocked attempt to register an Admin account under email ${email}.`,
        type: 'warning',
        time: 'Just now'
      });

      return res.status(403).json({
        message: 'Admin accounts cannot be publicly registered.'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate unique employee ID if not provided
    const actualEmpId = employeeId || `E${Date.now().toString().slice(-4)}`;

    // Clean and title-case the name
    const formattedName = name
      .trim()
      .split(/\s+/)
      .map((n) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())
      .join(' ');

    // Create automatic initials avatar
    const initials = formattedName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const defaultSalary = requestedRole === 'hr' ? 82000 : 50000;
    const defaultDesignation = requestedRole === 'hr' ? 'HR Specialist' : 'Staff Member';

    const user = await User.create({
      employeeId: actualEmpId,
      name: formattedName,
      email,
      password,
      role: requestedRole,
      department: department || 'General',
      designation: defaultDesignation,
      phone: phone || '',
      avatar: initials,
      joinDate: new Date().toISOString().split('T')[0],
      salary: defaultSalary,
    });

    // Create notification for successful creation
    await Notification.create({
      title: 'New Account Created',
      message: `${name} has registered as a new ${requestedRole === 'hr' ? 'HR Specialist' : 'Employee'}.`,
      type: 'success',
      time: 'Just now',
      targetRole: 'hr'
    });

    if (user) {
      res.status(201).json({
        message: 'Registration successful! Your account is pending administrator approval. You will be able to log in once approved.'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Optional check for role mismatch if requested, but let's allow it or validate
      if (role && user.role !== role) {
        return res.status(400).json({ message: `Invalid credentials for role: ${role}` });
      }

      if (user.status === 'pending') {
        return res.status(403).json({ message: 'Your account is pending administrator approval. Please contact support.' });
      }

      if (user.status === 'inactive') {
        return res.status(403).json({ message: 'Your account is inactive. Please contact the administrator.' });
      }

      res.json({
        id: user.employeeId,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        phone: user.phone,
        joinDate: user.joinDate,
        salary: user.salary,
        bankDetails: user.bankDetails,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({
        id: user.employeeId,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        phone: user.phone,
        status: user.status,
        joinDate: user.joinDate,
        salary: user.salary,
        bankDetails: user.bankDetails,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update bank details for logged in user
// @route   PUT /api/auth/profile/bank
// @access  Private
router.put('/profile/bank', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const { bankName, accountNumber, ifscCode, branchName, accountHolderName } = req.body;
      user.bankDetails = {
        bankName: bankName || '',
        accountNumber: accountNumber || '',
        ifscCode: ifscCode || '',
        branchName: branchName || '',
        accountHolderName: accountHolderName || user.name
      };
      const updatedUser = await user.save();
      res.json({
        message: 'Bank details updated successfully!',
        bankDetails: updatedUser.bankDetails
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user profile details (name, email, phone)
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const { name, email, phone } = req.body;
      
      // If email is changing, make sure it is not already taken
      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email is already in use by another account.' });
        }
        user.email = email;
      }
      
      if (name) {
        // Clean and title-case the name
        const formattedName = name
          .trim()
          .split(/\s+/)
          .map((n) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())
          .join(' ');
        
        user.name = formattedName;
        // Update initials avatar if name changes
        user.avatar = formattedName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
      }
      
      if (phone !== undefined) {
        user.phone = phone;
      }
      
      const updatedUser = await user.save();
      res.json({
        message: 'Profile details updated successfully!',
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user password
// @route   PUT /api/auth/profile/password
// @access  Private
router.put('/profile/password', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper to send email or log OTP fallback
const sendOtpEmail = async (email, name, otp) => {
  console.log(`=========================================`);
  console.log(`FORGOT PASSWORD OTP GENERATED:`);
  console.log(`Email: ${email}`);
  console.log(`Name: ${name}`);
  console.log(`OTP: ${otp}`);
  console.log(`=========================================`);

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    return { success: true, simulated: true };
  }

  try {
    let transporter;
    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        family: 4, // Force IPv4 to prevent Render ENETUNREACH IPv6 issue
        connectionTimeout: 10000, // 10 seconds timeout
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });
    } else {
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        family: 4, // Force IPv4 to prevent Render ENETUNREACH IPv6 issue
        connectionTimeout: 10000, // 10 seconds timeout
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });
    }

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Dayflow HRMS'}" <${smtpUser}>`,
      to: email,
      subject: 'Dayflow HRMS - Password Reset OTP',
      html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 480px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #6366f1; margin-bottom: 16px;">Dayflow Password Reset</h2>
          <p>Hi ${name},</p>
          <p>You requested to reset your password. Use the following 6-digit One Time Password (OTP) to proceed with resetting your credentials. This code is valid for 3 minutes:</p>
          <div style="background: #f4f6f9; padding: 16px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #0f172a; margin: 24px 0;">
            ${otp}
          </div>
          <p style="font-size: 11px; color: #64748b;">If you did not initiate this request, you can safely ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, simulated: false };
  } catch (error) {
    console.error('Nodemailer error sending email:', error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

// @desc    Initiate forgot password (generate & send OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user account found with this email address.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = new Date(Date.now() + 3 * 60 * 1000); // 3 min (180 seconds)
    await user.save();

    const result = await sendOtpEmail(user.email, user.name, otp);

    res.json({
      message: result.simulated 
        ? 'OTP verification code generated successfully. (Simulated, logged to backend console).'
        : 'A 6-digit OTP verification code has been sent to your email.',
      simulated: result.simulated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP code are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.resetOtp || user.resetOtp !== otp || new Date() > user.resetOtpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP code.' });
    }

    res.json({ message: 'OTP code verified successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.resetOtp || user.resetOtp !== otp || new Date() > user.resetOtpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP code.' });
    }

    user.password = newPassword;
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();

    res.json({ message: 'Password has been reset successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
