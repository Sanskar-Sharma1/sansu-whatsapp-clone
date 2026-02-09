import { OAuth2Client } from "google-auth-library";
import { db } from "../../config/db";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(idToken: string) {
  console.log("Hello 1");
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  console.log("Hello 2");
  const payload = ticket.getPayload();

  if (!payload) throw new Error("Invalid token");

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    avatar: payload.picture,
  };
}

export async function findOrCreateUser(googleUser: any) {
  const users = db.collection("users");

  let user = await users.findOne({ googleId: googleUser.googleId });

  if (!user) {
    const result = await users.insertOne({
      ...googleUser,
      createdAt: new Date(),
    });

    user = { _id: result.insertedId, ...googleUser };
  }

  return user;
}
