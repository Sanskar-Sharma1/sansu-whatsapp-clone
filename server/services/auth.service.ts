import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { User, IUserPublic, toPublicUser } from "../models/User.model";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, env.JWT_SECRET) as { userId: string };
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ token: string; user: IUserPublic }> {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, "Email already in use");

  const user = new User({ name, email, passwordHash: password, provider: "local" });
  await user.save();

  const token = generateToken(user._id.toString());
  return { token, user: toPublicUser(user) };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ token: string; user: IUserPublic }> {
  // passwordHash is select:false on the schema — opt in explicitly here.
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!user || user.provider !== "local") throw new ApiError(401, "Invalid credentials");

  const valid = await user.comparePassword(password);
  if (!valid) throw new ApiError(401, "Invalid credentials");

  const token = generateToken(user._id.toString());
  return { token, user: toPublicUser(user) };
}

export async function verifyGoogleToken(idToken: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) throw new ApiError(401, "Invalid Google token");

  // Only trust Google emails Google has verified — prevents account-linking abuse.
  if (payload.email_verified !== true || !payload.email) {
    throw new ApiError(401, "Google account email is not verified");
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email,
    avatarUrl: payload.picture,
  };
}

export async function findOrCreateGoogleUser(
  googleUser: Awaited<ReturnType<typeof verifyGoogleToken>>
): Promise<{ token: string; user: IUserPublic }> {
  const email = googleUser.email.toLowerCase();
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: googleUser.name,
      email,
      avatarUrl: googleUser.avatarUrl,
      googleId: googleUser.googleId,
      provider: "google",
    });
  } else if (user.provider !== "google") {
    // A password account already owns this email. Don't silently link a Google
    // identity to it — require the user to sign in with their password first.
    throw new ApiError(
      409,
      "An account with this email already exists. Sign in with your password instead."
    );
  } else if (!user.googleId) {
    user.googleId = googleUser.googleId;
    if (!user.avatarUrl && googleUser.avatarUrl) user.avatarUrl = googleUser.avatarUrl;
    await user.save();
  }

  const token = generateToken(user._id.toString());
  return { token, user: toPublicUser(user) };
}

