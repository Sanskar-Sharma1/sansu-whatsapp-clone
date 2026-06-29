import { Socket } from "socket.io";
import { verifyToken } from "../services/auth.service";
import { User, PUBLIC_USER_FIELDS, toPublicUser } from "../models/User.model";

function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return undefined;
}

export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void
) {
  try {
    // Prefer the httpOnly cookie (cookie-only auth); fall back to a handshake token.
    const token =
      readCookie(socket.handshake.headers.cookie, "authToken") ??
      (socket.handshake.auth?.token as string | undefined);

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const { userId } = verifyToken(token);
    const user = await User.findById(userId).select(PUBLIC_USER_FIELDS).lean();

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.data.user = toPublicUser(user);
    next();
  } catch {
    next(new Error("Invalid token"));
  }
}
