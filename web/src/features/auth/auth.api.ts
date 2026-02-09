import { api } from "../../services/axios";

export async function loginWithGoogle(idToken: string) {
  const response = await api.post("/auth/google", { idToken });
  if(response.data){
    localStorage.setItem("accessToken", response.data.accessToken);
    return response.data;
  }
  return null;
}
