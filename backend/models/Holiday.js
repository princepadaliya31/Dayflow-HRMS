import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD for simple handling
      required: true,
    },
    type: {
      type: String,
      enum: ['public', 'company'],
      default: 'public',
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Holiday = mongoose.model('Holiday', holidaySchema);
export default Holiday;
