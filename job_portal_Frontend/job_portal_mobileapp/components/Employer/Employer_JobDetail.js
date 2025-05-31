import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Button,
  Alert,
  TouchableOpacity,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, endpoints } from "../../configs/Api";

const STATUS_COLORS = {
  pending: "#FFA500", // cam
  accepted: "#4CAF50", // xanh lá
  rejected: "#F44336", // đỏ
  completed: "#2196F3", // xanh dương
};

const Employees_JobDetail = ({ route, navigation }) => {
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobAndApplications = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        alert("Bạn chưa đăng nhập!");
        setLoading(false);
        return;
      }

      const jobRes = await authAPI(token).get(`${endpoints.jobs}${jobId}/`);
      setJob(jobRes.data);

      const applicationsRes = await authAPI(token).get(
        `${endpoints.applications}?job_id=${jobId}`
      );
      setApplications(applicationsRes.data);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      alert("Lỗi khi tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobAndApplications();
  }, [jobId]);

  const changeStatus = async (appId, newStatus) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      await authAPI(token).post(
        `${endpoints.applications}${appId}/update_status/`,
        { status: newStatus }
      );
      fetchJobAndApplications();
    } catch (err) {
      console.error(
        "Lỗi khi cập nhật trạng thái:",
        err.response?.data || err.message
      );
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái.");
    }
  };

  const openCVLink = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Lỗi", "Không thể mở CV.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy công việc.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("JobDetail", { job });
        }}
      >
        <Text style={styles.title}>{job.title}</Text>
      </TouchableOpacity>
      <Text style={styles.label}>Mô tả công việc:</Text>
      <Text style={styles.text}>{job.description}</Text>

      <Text style={styles.label}>Ngày đăng:</Text>
      <Text style={styles.text}>
        {new Date(job.created_at).toLocaleDateString()}
      </Text>

      <Text style={styles.label}>Danh sách ứng tuyển:</Text>
      {applications.length > 0 ? (
        applications.map((app) => (
          <View key={app.id} style={styles.applicationItem}>
            <Text style={styles.applicantName}>🧑 {app.candidate}</Text>
            <Text style={styles.text}>
              📅 Ngày ứng tuyển: {new Date(app.applied_at).toLocaleDateString()}
            </Text>

            <TouchableOpacity onPress={() => openCVLink(app.cv)}>
              <Text style={styles.cvLink}>📎 Xem CV</Text>
            </TouchableOpacity>

            <Text style={styles.coverLetter}>📩 {app.cover_letter}</Text>

            <Text
              style={[
                styles.applicationStatus,
                { color: STATUS_COLORS[app.status] || "black" },
              ]}
            >
              Trạng thái: {app.status.toUpperCase()}
            </Text>

            <View style={styles.buttonRow}>
              {["pending", "accepted", "rejected", "completed"].map(
                (status) => {
                  const isCurrent = app.status === status;
                  return (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusButton,
                        {
                          backgroundColor: isCurrent
                            ? "#333"
                            : STATUS_COLORS[status],
                        },
                      ]}
                      onPress={() =>
                        Alert.alert(
                          "Xác nhận",
                          `Bạn chắc chắn đổi trạng thái thành "${status}"?`,
                          [
                            { text: "Hủy", style: "cancel" },
                            {
                              text: "OK",
                              onPress: () => changeStatus(app.id, status),
                            },
                          ]
                        )
                      }
                    >
                      <Text style={styles.statusButtonText}>{status}</Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>
          </View>
        ))
      ) : (
        <Text>Chưa có ứng tuyển nào cho công việc này.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#f9f9f9",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2c3e50",
    textDecorationLine: "underline",
  },
  label: {
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
    fontSize: 16,
    color: "#444",
  },
  text: {
    fontSize: 16,
    color: "#555",
  },
  applicationItem: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#222",
  },
  cvLink: {
    color: "#1E90FF",
    textDecorationLine: "underline",
    marginVertical: 5,
    fontSize: 16,
  },
  coverLetter: {
    fontSize: 15,
    fontStyle: "italic",
    marginTop: 5,
    color: "#666",
  },
  applicationStatus: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    justifyContent: "space-between",
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 5,
    width: "48%",
  },
  statusButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    textTransform: "capitalize",
  },
});

export default Employees_JobDetail;
