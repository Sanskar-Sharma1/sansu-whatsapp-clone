import { User, IUserPublic, PUBLIC_USER_FIELDS, toPublicUser } from "../../models/User.model";

export async function getAllUsersExcept(userId: string): Promise<IUserPublic[]> {
  const users = await User.find({ _id: { $ne: userId } })
    .select(PUBLIC_USER_FIELDS)
    .lean();
  return users.map(toPublicUser);
}

export async function getUserById(userId: string): Promise<IUserPublic | null> {
  const user = await User.findById(userId).select(PUBLIC_USER_FIELDS).lean();
  return user ? toPublicUser(user) : null;
}
