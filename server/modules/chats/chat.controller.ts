import { Request, Response } from "express";
import {
  getChatsForUser,
  findOrCreatePrivateChat,
} from "./chat.service";

/** GET /chats */
export async function getChatsController(req: Request, res: Response) {
  try {
    const userId = req.userId!;

    const chats = await getChatsForUser(userId);

    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
}

/** POST /chats/private */
export async function createPrivateChatController(
  req: Request,
  res: Response
) {
  try {
    const userA = req.userId!;
    const { userId: userB } = req.body;

    if (!userB) {
      return res.status(400).json({ message: "userId required" });
    }

    const chat = await findOrCreatePrivateChat(userA, userB);

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create chat" });
  }
}
