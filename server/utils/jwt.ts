import jwt from "jsonwebtoken";

const JWT_SECRET = "supersecret"; // later from env

export function signJwt(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
