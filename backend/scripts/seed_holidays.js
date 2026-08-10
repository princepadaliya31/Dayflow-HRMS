import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Holiday from '../models/Holiday.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log('Connecting to', mongoUri);
    await mongoose.connect(mongoUri);
    
    // Clear existing
    await Holiday.deleteMany({});
    
    const seedHolidays = [
      // Public Holidays
      { title: "New Year's Day", date: "2026-01-01", type: "public", description: "Beginning of the solar calendar year." },
      { title: "Republic Day", date: "2026-01-26", type: "public", description: "Commemorating the adoption of the Constitution of India." },
      { title: "Good Friday", date: "2026-04-03", type: "public", description: "Christian holiday commemorating the crucifixion of Jesus Christ." },
      { title: "Independence Day", date: "2026-08-15", type: "public", description: "Celebrating nation's freedom from British rule." },
      { title: "Gandhi Jayanti", date: "2026-10-02", type: "public", description: "Honoring the birthday of Mahatma Gandhi." },
      { title: "Diwali", date: "2026-11-09", type: "public", description: "Festival of Lights celebrating victory of light over darkness." },
      { title: "Christmas Day", date: "2026-12-25", type: "public", description: "Celebration of the birth of Jesus Christ." },
      
      // Company Events
      { title: "Annual Hackathon", date: "2026-03-20", type: "company", description: "48-hour team building and product innovation competition." },
      { title: "Foundation Day", date: "2026-06-15", type: "company", description: "Celebrating the establishment anniversary of Dayflow Technologies." },
      { title: "Mid-Year Strategy Review", date: "2026-07-10", type: "company", description: "All-hands alignment review for our product roadmap." },
      { title: "Annual Team Retreat", date: "2026-09-18", type: "company", description: "Outbound team building retreat and leisure activities." },
      { title: "Year-End Gala", date: "2026-12-18", type: "company", description: "Dinner and celebration to look back at our yearly achievements." },
    ];
    
    const result = await Holiday.insertMany(seedHolidays);
    console.log('Seeded holidays count:', result.length);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
