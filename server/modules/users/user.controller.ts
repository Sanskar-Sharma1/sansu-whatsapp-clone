import { Request, Response } from "express";
import { getAllUsersExcept, getUserById } from "./user.service";
import { ApiError } from "../../utils/ApiError";
import { assertObjectId } from "../../utils/objectId";

export async function getAllUsersController(req: Request, res: Response) {
  const users = await getAllUsersExcept(req.user!._id);
  res.json({ users });
}

export async function getUserByIdController(req: Request, res: Response) {
  const id = assertObjectId(req.query["id"], "user id");
  const user = await getUserById(id);
  if (!user) throw new ApiError(404, "User not found");
  res.json({ user });
}
