import type { AxiosRequestConfig } from "axios";
import { api } from "./axios";

/**
 * Thin typed wrapper over the shared axios instance. Returns the response body
 * directly so callers work with typed payloads, not the full AxiosResponse.
 * Reuses `api` so cookie auth (`withCredentials`) and the 401 interceptor apply.
 */
export const axiosWrapper = {
  get: <TRes>(url: string, config?: AxiosRequestConfig) =>
    api.get<TRes>(url, config).then((r) => r.data),
  post: <TRes, TReq = unknown>(
    url: string,
    data?: TReq,
    config?: AxiosRequestConfig
  ) => api.post<TRes>(url, data, config).then((r) => r.data),
};
