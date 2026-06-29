import { axiosWrapper } from "../services/axiosWrapper";
import { getBackendUrl } from "../utils/url";
import type {
  CreateDirectMessageRequest,
  CreateDirectMessageResponse,
  CreateGroupRequest,
  CreateGroupResponse,
  GetRoomsResponse,
  GetRoomMessagesRequest,
  GetRoomMessagesResponse,
} from "./types";

export const createDirectMessageRequest = (data: CreateDirectMessageRequest) =>
  axiosWrapper.post<CreateDirectMessageResponse, CreateDirectMessageRequest>(
    `${getBackendUrl()}/rooms/createDirectMessage`,
    data
  );

export const createGroupRequest = (data: CreateGroupRequest) =>
  axiosWrapper.post<CreateGroupResponse, CreateGroupRequest>(
    `${getBackendUrl()}/rooms/createGroup`,
    data
  );

export const getRoomsRequest = () =>
  axiosWrapper.get<GetRoomsResponse>(`${getBackendUrl()}/rooms/getRooms`);

export const getRoomMessagesRequest = (data: GetRoomMessagesRequest) =>
  axiosWrapper.get<GetRoomMessagesResponse>(
    `${getBackendUrl()}/rooms/getRoomMessages`,
    { params: data }
  );
