import type { IUser, IRoom, IMessage } from "../types";

// ---- Auth ----
export interface AuthResponse {
  token: string;
  user: IUser;
}
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface GoogleLoginRequest {
  idToken: string;
}
export interface GetUserDetailsResponse {
  user: IUser;
}

// ---- Users ----
export interface GetUsersResponse {
  users: IUser[];
}
export interface GetUserRequest {
  id: string;
}
export interface GetUserResponse {
  user: IUser;
}

// ---- Rooms ----
export interface CreateDirectMessageRequest {
  targetUserId: string;
}
export interface CreateDirectMessageResponse {
  room: IRoom;
}
export interface CreateGroupRequest {
  name: string;
  memberIds: string[];
}
export interface CreateGroupResponse {
  room: IRoom;
}
export interface GetRoomsResponse {
  rooms: IRoom[];
}
export interface GetRoomMessagesRequest {
  roomId: string;
}
export interface GetRoomMessagesResponse {
  messages: IMessage[];
}
