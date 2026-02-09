import { api } from "../../services/axios";

export async function fetchMessages(chatId: string, cursor?: string) {
  const { data } = await api.get(`/messages/${chatId}`, {
    params: { cursor },
  });

  return data;
}

export async function sendMessage(chatId: string, content: string) {
  const { data } = await api.post("/messages", {
    chatId,
    content,
  });

  return data;
}
