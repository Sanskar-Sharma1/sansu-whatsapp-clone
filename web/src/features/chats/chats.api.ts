import { api } from "../../services/axios";

export async function fetchChats() {
  const { data } = await api.get("/chats");
  return data;
}

export async function createPrivateChat(userId: string) {
  const { data } = await api.post("/chats/private", { userId });
  return data;
}
