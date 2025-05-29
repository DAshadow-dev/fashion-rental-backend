import app from './app';
import { connectDB } from './config/db';
import dotenv from 'dotenv';
import seedDatabase from './utils/seed';
dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  // seedDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
