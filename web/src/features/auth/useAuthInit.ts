import { useEffect, useContext } from "react";
import { api } from "../../services/axios";
import { AuthContext } from "./AuthContext";

export function useAuthInit() {
  const { setUserId } = useContext(AuthContext);

  useEffect(() => {
    async function init() {
      try {
        const { data } = await api.get("/users/me");
        if (data._id) {
          setUserId(data._id);
        }
      } catch {
        localStorage.removeItem("accessToken");
      }
    }

    init();
  }, []);
}
