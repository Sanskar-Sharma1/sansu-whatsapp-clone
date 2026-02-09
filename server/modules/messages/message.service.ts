import { ObjectId } from "mongodb";
import { db } from "../../config/db";

const messages = db.collection("messages");
const chats = db.collection("chats");

/**
 * Get paginated messages of a chat
 */
export async function getMessages(chatId: string, cursor?: string) {
  const cid = new ObjectId(chatId);

  const query: any = { chatId: cid };

  // cursor pagination (older messages)
  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const result = await messages
    .find(query)
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();

  return result.reverse(); // oldest → newest for UI
}

/**
 * Send a new message
 */
export async function sendMessage(
  chatId: string,
  senderId: string,
  content: string,
  type: string = "text"
) {
  const cid = new ObjectId(chatId);
  const sid = new ObjectId(senderId);

  const messageDoc = {
    chatId: cid,
    senderId: sid,
    type,
    content,
    seenBy: [sid],
    createdAt: new Date(),
  };

  const result = await messages.insertOne(messageDoc);

  /** Update chat preview */
  await chats.updateOne(
    { _id: cid },
    {
      $set: {
        lastMessage: content,
        lastMessageAt: new Date(),
      },
    }
  );

  return {
    _id: result.insertedId,
    ...messageDoc,
  };
}
