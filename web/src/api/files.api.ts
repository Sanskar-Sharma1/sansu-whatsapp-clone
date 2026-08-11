import { axiosWrapper } from "../services/axiosWrapper";
import { getBackendUrl } from "../utils/url";
import type { IUploadResponse } from "../types";

export const uploadFileRequest = (file: File) => {
  const form = new FormData();
  form.append("file", file);

  return axiosWrapper.post<IUploadResponse, FormData>(
    `${getBackendUrl()}/files/uploadFile`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
};
