// const BASE_URL = 'http://192.168.1.10:8000/';
// export const authApis = (token) => {
//     return axios.create({
//         baseURL: BASE_URL,
//         headers: {
//             'Authorization': `Bearer ${token}`
//         }
//     });
// }

// export default axios.create({
//     baseURL: BASE_URL
// });
import axios from "axios";

// Địa chỉ backend của bạn
const BASE_URL = "http://192.168.1.10:8000/";

// Hàm gọi API với token
export const getJobs = async () => {
  // Giả sử bạn lấy token từ AsyncStorage hoặc từ state của ứng dụng
  const token = "LUuWDDhqq05QgkARoQooXBKFbBbaLD"; // Lấy token từ nơi bảo mật

  try {
    const res = await axios.get(`${BASE_URL}jobs/`, {
      headers: {
        Authorization: `Bearer ${token}`, // Gửi token trong header Authorization
      },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch jobs", err);
    return [];
  }
};
