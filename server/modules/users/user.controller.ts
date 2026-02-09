import { Request, Response } from "express";
import { getUserById } from "./user.service";

export async function getMeController(req: Request, res: Response) {
  try {
    const userId = req.userId!;

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
}
