import apiClient from "./apiClient";

export enum PushProvider {
  FCM = "fcm",
}

export enum Platform {
  ANDROID = "android",
  IOS = "ios",
  WEB = "web",
}

export interface UserDeviceCreate {
  user_id: number;
  provider: PushProvider;
  platform: Platform;
  device_install_id: string;
  push_token: string;
  app_version?: string;
  locale?: string;
}

const deviceService = {
  registerDevice: async (data: UserDeviceCreate) => {
    const response = await apiClient.post("/devices/user-devices/", data);
    return response.data;
  },

  deleteDevice: async (deviceId: number) => {
    const response = await apiClient.delete(`/devices/user-devices/${deviceId}`);
    return response.data;
  },
};

export default deviceService;
