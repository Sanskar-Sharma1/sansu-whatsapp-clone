import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  avatarUrl?: string;
  provider: "local" | "google";
  googleId?: string;
  isOnline: boolean;
  lastSeen: Date;
  comparePassword(plain: string): Promise<boolean>;
}

export interface IUserPublic {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: "local" | "google";
  isOnline: boolean;
  lastSeen: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    // Never returned by default — opt in with `.select("+passwordHash")` only where needed (login).
    passwordHash: { type: String, select: false },
    avatarUrl: { type: String },
    googleId: { type: String, sparse: true },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("passwordHash") || !this.passwordHash) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

UserSchema.methods.comparePassword = function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash ?? "");
};

export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

/** Mongoose `.select(...)` projection that returns exactly the public fields. */
export const PUBLIC_USER_FIELDS = "name email avatarUrl provider isOnline lastSeen";

type PublicUserSource = {
  _id: unknown;
  name: string;
  email: string;
  avatarUrl?: string | null;
  provider: "local" | "google";
  isOnline: boolean;
  lastSeen: Date;
};

/** Maps any user document (hydrated or lean) to the safe public shape. */
export function toPublicUser(user: PublicUserSource): IUserPublic {
  return {
    _id: String(user._id),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? undefined,
    provider: user.provider,
    isOnline: user.isOnline,
    lastSeen: user.lastSeen,
  };
}
