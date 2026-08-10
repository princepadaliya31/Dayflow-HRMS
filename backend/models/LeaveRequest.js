import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['sick', 'casual', 'annual', 'maternity', 'unpaid'],
      required: true,
    },
    from: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    to: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    days: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    appliedOn: {
      type: String, // YYYY-MM-DD
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
export default LeaveRequest;
