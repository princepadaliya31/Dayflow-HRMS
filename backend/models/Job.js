import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    salaryRange: {
      type: String,
      default: '',
    },
    experience: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    openings: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model('Job', jobSchema);
export default Job;
