import { Request, Response } from "express";
import { verifyGoogleToken, findOrCreateUser } from "./auth.service";
import { signJwt } from "../../utils/jwt";

export async function googleAuthController(req: Request, res: Response) {
  try {
    const { idToken } = req.body;
    console.log("google auth triggered");

    if (!idToken) {
      return res.status(400).json({ message: "idToken required" });
    }

    const googleUser = await verifyGoogleToken(idToken);
    console.log("Hello 3");

    const user: any = await findOrCreateUser(googleUser);
    console.log("Hello 4");

    const accessToken = signJwt({ userId: user._id });

    res.json({
      accessToken,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Authentication failed" });
  }
}
