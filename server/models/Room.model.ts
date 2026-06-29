import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { ApiError } from "../utils/ApiError";

export interface IRoom extends Document {
  name?: string;
  type: "dm" | "group";
  members: Types.ObjectId[];
  createdBy: Types.ObjectId;
  /** Deterministic "minId_maxId" key for DMs — enforces one DM per user pair. */
  dmKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RoomModel extends Model<IRoom> {
  findOrCreateDM(userAId: string, userBId: string): Promise<IRoom>;
}

const RoomSchema = new Schema<IRoom>(
  {
    name: { type: String },
    type: { type: String, enum: ["dm", "group"], required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dmKey: { type: String },
  },
  { timestamps: true }
);

// One DM room per user pair. Partial index so it only applies to DM rooms.
RoomSchema.index(
  { dmKey: 1 },
  { unique: true, partialFilterExpression: { dmKey: { $type: "string" } } }
);

function buildDmKey(userAId: string, userBId: string): string {
  return [userAId, userBId].sort().join("_");
}

RoomSchema.statics.findOrCreateDM = async function (
  userAId: string,
  userBId: string
): Promise<IRoom> {
  if (userAId === userBId) {
    throw new ApiError(400, "Cannot create a DM with yourself");
  }

  const a = new Types.ObjectId(userAId);
  const b = new Types.ObjectId(userBId);
  const dmKey = buildDmKey(userAId, userBId);

  try {
    // Atomic upsert on the unique dmKey — removes the find-then-create race
    // that previously let two concurrent requests create duplicate DMs.
    return await this.findOneAndUpdate(
      { dmKey },
      { $setOnInsert: { type: "dm", members: [a, b], createdBy: a, dmKey } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    // A concurrent upsert won the race on the unique index — return the winner.
    if ((err as { code?: number }).code === 11000) {
      const existing = await this.findOne({ dmKey });
      if (existing) return existing;
    }
    throw err;
  }
};

export const Room = mongoose.model<IRoom, RoomModel>("Room", RoomSchema);
