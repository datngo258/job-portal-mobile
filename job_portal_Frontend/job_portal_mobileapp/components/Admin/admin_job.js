import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { authAPI, endpoints } from "../../configs/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "./admin_style/admin_style";

const AdminJob = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const storedToken = await AsyncStorage.getItem("access_token");
      if (!storedToken) {
        setError("Không tìm thấy token.");
        setLoading(false);
        return;
      }

      setToken(storedToken);
      try {
        const response = await authAPI(storedToken).get(endpoints.jobs_admin);
        if (Array.isArray(response.data)) {
          setJobs(response.data);
        } else {
          console.warn("Dữ liệu không phải mảng:", response.data);
          setJobs([]);
        }
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách công việc.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDelete = async (jobId) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc muốn xóa công việc này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await authAPI(token).delete(`${endpoints.jobs_admin}${jobId}/`);
            setJobs((prev) => prev.filter((job) => job.id !== jobId));
          } catch (err) {
            console.error(err);
            Alert.alert("Lỗi", "Xóa công việc thất bại.");
          }
        },
      },
    ]);
  };

  if (loading)
    return (
      <ActivityIndicator size="large" color="#007bff" style={styles.centered} />
    );
  if (error)
    return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách công việc</Text>

      {jobs.length === 0 ? (
        <Text style={styles.noData}>Không có công việc nào.</Text>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.text}>ID: {item.id}</Text>
              <Text style={styles.text}>
                Công ty: {item.company || "Không rõ"}
              </Text>
              <Text style={styles.text}>
                Loại:{" "}
                {item.job_type === "part_time"
                  ? "Bán thời gian"
                  : item.job_type}
              </Text>
              <Text style={styles.text}>
                Vị trí: {item.location || "Không rõ"}
              </Text>
              <Text style={styles.text}>
                Lương: {Number(item.salary_min).toLocaleString()} -{" "}
                {Number(item.salary_max).toLocaleString()} VND
              </Text>
              <Text style={styles.text}>
                Thời gian làm việc: {item.working_hours} giờ
              </Text>
              <Text style={styles.text}>
                Trạng thái:{" "}
                {item.is_active ? "Đang hoạt động" : "Ngừng hoạt động"}
              </Text>
              <Text style={styles.text}>Người tạo: {item.creator_name}</Text>
              <Text style={styles.text}>
                Ngày tạo:{" "}
                {new Date(item.created_at).toLocaleDateString("vi-VN")}
              </Text>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default AdminJob;
