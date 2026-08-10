import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    time: {
      type: String, // Stored as human-readable string (e.g. '2 hours ago') or generated dynamically
      default: 'Just now',
    },
    read: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'success'],
      default: 'info',
    },
    targetRole: {
      type: String,
      enum: ['all', 'admin', 'hr'],
      default: 'all',
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
