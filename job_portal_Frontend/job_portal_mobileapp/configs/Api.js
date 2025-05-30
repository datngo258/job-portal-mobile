import qs from "qs";
import axios from "axios";
export const BASE_URL = "http://10.0.2.2:8000";
export const endpoints = {
  login: "/o/token/",
  current_user: "/users/current_user/",
  register: "/users/",
  jobs: "/jobs/",
  applications: "/applications/",
  reviews: "/reviews/",
  statistics: "/statistics/",
  employer_company: "/employer/companies/",
  my_job: "/jobs/my_jobs/",
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
