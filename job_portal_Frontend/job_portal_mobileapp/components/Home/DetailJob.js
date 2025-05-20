import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
export default function JobDetail({ route, navigation }) {
  const { job } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.company}>Công ty: {job.company}</Text>
      <Text style={styles.label}>Mô tả:</Text>
      <Text style={styles.text}>{job.description}</Text>

      <Text style={styles.label}>Yêu cầu:</Text>
      <Text style={styles.text}>{job.requirements}</Text>

      <Text style={styles.label}>Loại công việc:</Text>
      <Text style={styles.text}>{job.job_type}</Text>

      <Text style={styles.label}>Địa điểm:</Text>
      <Text style={styles.text}>{job.location}</Text>

      <Text style={styles.label}>Mức lương:</Text>
      <Text style={styles.text}>
        {job.salary_min} - {job.salary_max}
      </Text>

      <Text style={styles.label}>Giờ làm việc:</Text>
      <Text style={styles.text}>{job.working_hours}</Text>

      <Text style={styles.label}>Trạng thái tuyển:</Text>
      <Text style={styles.text}>
        {job.is_active ? "Đang hoạt động" : "Ngưng hoạt động"}
      </Text>

      <Text style={styles.label}>Đã đăng tuyển:</Text>
      <Text style={styles.text}>{dayjs(job.created_at).fromNow()}</Text>

      <Text style={styles.label}>Ngày cập nhật:</Text>
      <Text style={styles.text}>
        {new Date(job.updated_at).toLocaleString()}
      </Text>
      <TouchableOpacity
        style={styles.btnBack}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.btnText}>Quay về Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },
  label: {
    fontWeight: "600",
    marginTop: 10,
  },
  text: {
    fontSize: 16,
    marginTop: 3,
  },
  btnBack: {
    marginTop: 30,
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
