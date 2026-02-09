import { Request, Response } from "express";
import { getMessages, sendMessage } from "./message.service";

/** GET /messages/:chatId */
export async function getMessagesController(req: Request, res: Response) {
  try {
    const { chatId } = req.params;
    const { cursor } = req.query;

    const msgs = await getMessages(chatId, cursor as string | undefined);

    res.json(msgs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
}

/** POST /messages */
export async function sendMessageController(req: Request, res: Response) {
  try {
    const senderId = req.userId!;
    const { chatId, content, type } = req.body;

    if (!chatId || !content) {
      return res.status(400).json({ message: "chatId & content required" });
    }

    const msg = await sendMessage(chatId, senderId, content, type);

    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
}
