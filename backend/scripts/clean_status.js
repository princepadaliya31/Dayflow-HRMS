import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Payroll from '../models/Payroll.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log('Connecting to', mongoUri);
    await mongoose.connect(mongoUri);
    const res = await Payroll.updateMany({ status: 'processing' }, { status: 'pending' });
    console.log(`Updated ${res.modifiedCount} records from processing to pending.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
