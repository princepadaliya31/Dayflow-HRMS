import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    manager: {
      type: String,
      default: '',
    },
    headCount: {
      type: Number,
      default: 0,
    },
    budget: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Department = mongoose.model('Department', departmentSchema);
export default Department;
