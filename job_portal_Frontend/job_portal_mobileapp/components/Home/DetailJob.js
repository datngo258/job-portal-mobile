import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import styles from "./style";

dayjs.extend(relativeTime);

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

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Loại công việc:</Text>
          <Text style={styles.text}>{job.job_type}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Địa điểm:</Text>
          <Text style={styles.text}>{job.location}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Mức lương:</Text>
          <Text style={styles.text}>
            {job.salary_min} - {job.salary_max}
          </Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Giờ làm việc:</Text>
          <Text style={styles.text}>{job.working_hours}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Trạng thái:</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: job.is_active ? "green" : "red" },
              ]}
            />
            <Text style={styles.text}>
              {job.is_active ? "Đang hoạt động" : "Ngưng hoạt động"}
            </Text>
          </View>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Đã đăng tuyển:</Text>
          <Text style={styles.text}>{dayjs(job.created_at).fromNow()}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.btnBack}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.btnText}>Quay về Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
