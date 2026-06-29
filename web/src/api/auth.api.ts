import { axiosWrapper } from "../services/axiosWrapper";
import { getBackendUrl } from "../utils/url";
import type {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  GoogleLoginRequest,
  GetUserDetailsResponse,
} from "./types";

export const registerRequest = (data: RegisterRequest) =>
  axiosWrapper.post<AuthResponse, RegisterRequest>(
    `${getBackendUrl()}/auth/register`,
    data
  );

export const loginRequest = (data: LoginRequest) =>
  axiosWrapper.post<AuthResponse, LoginRequest>(
    `${getBackendUrl()}/auth/login`,
    data
  );

export const googleLoginRequest = (data: GoogleLoginRequest) =>
  axiosWrapper.post<AuthResponse, GoogleLoginRequest>(
    `${getBackendUrl()}/auth/googleLogin`,
    data
  );

export const getUserDetailsRequest = () =>
  axiosWrapper.get<GetUserDetailsResponse>(
    `${getBackendUrl()}/auth/getUserDetails`
  );

export const logoutRequest = () =>
  axiosWrapper.post<void>(`${getBackendUrl()}/auth/logout`);
