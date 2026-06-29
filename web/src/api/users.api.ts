import { axiosWrapper } from "../services/axiosWrapper";
import { getBackendUrl } from "../utils/url";
import type { GetUsersResponse, GetUserRequest, GetUserResponse } from "./types";

export const getUsersRequest = () =>
  axiosWrapper.get<GetUsersResponse>(`${getBackendUrl()}/users/getUsers`);

export const getUserRequest = (data: GetUserRequest) =>
  axiosWrapper.get<GetUserResponse>(`${getBackendUrl()}/users/getUser`, {
    params: data,
  });
