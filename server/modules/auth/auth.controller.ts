import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  verifyGoogleToken,
  findOrCreateGoogleUser,
} from "../../services/auth.service";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function registerController(req: Request, res: Response) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, "name, email and password are required");
  }
  const { token, user } = await registerUser(name, email, password);
  res.cookie("authToken", token, COOKIE_OPTIONS);
  res.status(201).json({ token, user });
}

export async function loginController(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }
  const { token, user } = await loginUser(email, password);
  res.cookie("authToken", token, COOKIE_OPTIONS);
  res.json({ token, user });
}

export async function googleAuthController(req: Request, res: Response) {
  const { idToken } = req.body;
  if (!idToken) {
    throw new ApiError(400, "idToken is required");
  }
  const googleUser = await verifyGoogleToken(idToken);
  const { token, user } = await findOrCreateGoogleUser(googleUser);
  res.cookie("authToken", token, COOKIE_OPTIONS);
  res.json({ token, user });
}

export function getMeController(req: Request, res: Response) {
  res.json({ user: req.user });
}

export function logoutController(_req: Request, res: Response) {
  res.clearCookie("authToken", { ...COOKIE_OPTIONS, maxAge: undefined });
  res.json({ message: "Logged out" });
}
