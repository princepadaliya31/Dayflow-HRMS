import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: '',
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['applied', 'interviewing', 'shortlisted', 'hired', 'rejected'],
      default: 'applied',
    },
    appliedDate: {
      type: String,
      required: true,
    },
    resumeSummary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Candidate = mongoose.model('Candidate', candidateSchema);
export default Candidate;
