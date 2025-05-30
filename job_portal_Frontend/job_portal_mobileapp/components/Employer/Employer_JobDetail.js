import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, endpoints } from "../configs/Api";

const Employees_JobDetail = ({ route }) => {
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobAndApplications = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) {
          alert("Bạn chưa đăng nhập!");
          setLoading(false);
          return;
        }

        // Lấy chi tiết công việc
        const jobRes = await authAPI(token).get(`${endpoints.jobs}${jobId}/`);
        setJob(jobRes.data);

        // Lấy danh sách ứng tuyển cho công việc đó
        // Giả sử API hỗ trợ filter ứng tuyển theo job id, ví dụ:
        // /applications/?job=jobId
        // Nếu API khác, bạn chỉnh lại endpoint phù hợp
        const applicationsRes = await authAPI(token).get(
          `${endpoints.applications}?job=${jobId}`
        );
        setApplications(applicationsRes.data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
        alert("Lỗi khi tải dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndApplications();
  }, [jobId]);

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
      <Text style={styles.title}>{job.title}</Text>
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
            <Text style={styles.applicantName}>
              🧑 {app.applicant_name || app.applicant.username}
            </Text>
            <Text style={styles.applicationStatus}>
              Trạng thái: {app.status}
            </Text>
            {/* Thêm các trường khác nếu cần */}
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
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  label: {
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
  },
  applicationItem: {
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  applicationStatus: {
    fontSize: 14,
    color: "gray",
    marginTop: 4,
  },
});

export default Employees_JobDetail;
