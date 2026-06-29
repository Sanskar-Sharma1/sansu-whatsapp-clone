import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/auth.service";
import { User, PUBLIC_USER_FIELDS, toPublicUser } from "../models/User.model";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else if (req.cookies?.authToken) {
      token = req.cookies.authToken;
    }

    if (!token) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { userId } = verifyToken(token);
    const user = await User.findById(userId).select(PUBLIC_USER_FIELDS).lean();

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    req.user = toPublicUser(user);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
