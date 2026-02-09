import { MongoClient } from "mongodb";

const MONGO_URI = "mongodb://127.0.0.1:27017";
const DB_NAME = "whatsapp_clone";

export const client = new MongoClient(MONGO_URI);

export async function connectDB() {
  await client.connect();
  console.log("✅ MongoDB connected");
}

export const db = client.db(DB_NAME);
