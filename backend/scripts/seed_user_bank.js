import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log('Connecting to', mongoUri);
    await mongoose.connect(mongoUri);
    
    // Update user ppp (E016)
    const result = await User.updateOne(
      { employeeId: 'E016' },
      {
        $set: {
          bankDetails: {
            bankName: 'HDFC Bank',
            accountNumber: '6598565545',
            ifscCode: 'HDFC0001234',
            branchName: 'Bangalore',
            accountHolderName: 'ppp'
          }
        }
      }
    );
    
    console.log('Update Result:', result);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
