import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'hr', 'employee'],
      default: 'employee',
    },
    designation: {
      type: String,
      default: 'Staff Member',
    },
    department: {
      type: String,
      default: 'General',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on-leave', 'pending'],
      default: 'pending',
    },
    avatar: {
      type: String,
      default: '',
    },
    joinDate: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
      default: 0,
    },
    phone: {
      type: String,
      default: '',
    },
    bankDetails: {
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      branchName: { type: String, default: '' },
      accountHolderName: { type: String, default: '' }
    },
    resetOtp: {
      type: String,
      default: null,
    },
    resetOtpExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
