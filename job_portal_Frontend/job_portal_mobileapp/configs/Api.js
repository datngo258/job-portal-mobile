import qs from "qs";
import axios from "axios";
// export const BASE_URL = "http://172.165.50.4:8000";
// export const BASE_URL = "http://10.0.2.2:8000";
export const BASE_URL = "http://10.0.2.2:8000";
export const endpoints = {
  login: "/o/token/",
  current_user: "/users/current_user/",
  register: "/users/",
  jobs: "/jobs/",
  applications :  "/applications/",
};
export const authAPI = (accesstoken) =>
  axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${accesstoken}`,
    },
  });

export default axios.create({
  baseURL: BASE_URL,
});
