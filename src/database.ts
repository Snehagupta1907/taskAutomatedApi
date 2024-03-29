import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";


export async function connectDB() {
  try {
    await mongoose.connect(String(process.env.MONGODB_URI));
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}