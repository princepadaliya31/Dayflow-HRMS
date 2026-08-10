import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    month: {
      type: String, // e.g. "June 2026"
      required: true,
    },
    baseSalary: {
      type: Number,
      default: 0,
    },
    presentDays: {
      type: Number,
      default: 30,
    },
    basic: {
      type: Number,
      required: true,
    },
    hra: {
      type: Number,
      required: true,
    },
    allowances: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    net: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['paid', 'pending'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for employee and month
payrollSchema.index({ employeeId: 1, month: 1 }, { unique: true });

const Payroll = mongoose.model('Payroll', payrollSchema);
export default Payroll;
