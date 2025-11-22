// config/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to mongoDB successfully ✅");
   
  } catch (error) {
    console.error("Failed to connect to mongoDB:", error);
    process.exit(1); // stop server if DB fails
  }
};

export default connectDB;
