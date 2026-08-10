import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String, // Matches the E001, E002 style IDs or User reference
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
    date: {
      type: String, // e.g. YYYY-MM-DD
      required: true,
    },
    checkIn: {
      type: String,
      default: '--',
    },
    checkOut: {
      type: String,
      default: '--',
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day'],
      default: 'absent',
    },
    hours: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Unique combination of employeeId and date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
