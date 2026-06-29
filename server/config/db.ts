import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB() {
  let retries = 5;
  while (retries > 0) {
    try {
      await mongoose.connect(env.MONGO_URI);
      console.log("✅ MongoDB connected via Mongoose");
      return;
    } catch (err) {
      retries--;
      if (retries === 0) throw err;
      console.warn(`MongoDB connection failed, retrying... (${retries} left)`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}
