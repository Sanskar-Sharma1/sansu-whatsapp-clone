import { ObjectId } from "mongodb";
import { db } from "../../config/db";

const chats = db.collection("chats");
const users = db.collection("users");

/**
 * Get all chats for a user
 */
export async function getChatsForUser(userId: string) {
  const uid = new ObjectId(userId);

  const result = await chats
    .aggregate([
      { $match: { members: uid } },
      { $sort: { lastMessageAt: -1 } },
      // find the "other" user in private chat
      {
        $addFields: {
          otherMember: {
            $first: {
              $filter: {
                input: "$members",
                as: "m",
                cond: { $ne: ["$$m", uid] },
              },
            },
          },
        },
      },

      // join user info
      {
        $lookup: {
          from: "users",
          localField: "otherMember",
          foreignField: "_id",
          as: "user",
        },
      },

      { $unwind: "$user" },

      {
        $project: {
          _id: 1,
          type: 1,
          lastMessage: 1,
          lastMessageAt: 1,
          "user._id": 1,
          "user.name": 1,
          "user.avatar": 1,
          "user.email": 1,
        },
      },
    ])
    .toArray();

  return result;
}

/**
 * Find or create private chat between two users
 */
export async function findOrCreatePrivateChat(
  userA: string,
  userB: string
) {
  const a = new ObjectId(userA);
  const b = new ObjectId(userB);

  // check existing chat
  let chat = await chats.findOne({
    type: "private",
    members: { $all: [a, b], $size: 2 },
  });

  if (chat) return chat;

  // create new chat
  const result = await chats.insertOne({
    type: "private",
    members: [a, b],
    lastMessage: "",
    lastMessageAt: new Date(),
    createdAt: new Date(),
  });

  return {
    _id: result.insertedId,
    type: "private",
    members: [a, b],
  };
}
