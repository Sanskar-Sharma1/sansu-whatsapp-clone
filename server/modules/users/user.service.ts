import { ObjectId } from "mongodb";
import { db } from "../../config/db";

export async function getUserById(userId: string) {
  const users = db.collection("users");

  return users.findOne({ _id: new ObjectId(userId) });
}
