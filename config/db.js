// config/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/learn");
    console.log("Connected to mongoDB successfully ✅");
  } catch (error) {
    console.error("Failed to connect to mongoDB:", error);
    process.exit(1); // stop server if DB fails
  }
};

export default connectDB;
