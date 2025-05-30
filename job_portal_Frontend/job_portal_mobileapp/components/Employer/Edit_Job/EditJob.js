import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, endpoints } from "../../../configs/Api";

export default function EditJobScreen({ route, navigation }) {
  const { job } = route.params;

  const [title, setTitle] = useState(job.title);
  const [description, setDescription] = useState(job.description);
  const [location, setLocation] = useState(job.location);
  const [salaryMin, setSalaryMin] = useState(job.salary_min);
  const [salaryMax, setSalaryMax] = useState(job.salary_max);
  const [workingHours, setWorkingHours] = useState(job.working_hours);
  const [requirements, setRequirements] = useState(job.requirements);

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const updatedJob = {
        title,
        description,
        location,
        salary_min: Number(salaryMin),
        salary_max: Number(salaryMax),
        working_hours: Number(workingHours),
        requirements,
        job_type: job.job_type, // giữ lại job_type hiện tại
      };
      console.log(updatedJob);
      await authAPI(token).put(`${endpoints["jobs"]}${job.id}/`, updatedJob);
      Alert.alert("✅ Thành công", "Công việc đã được cập nhật!");
      navigation.navigate("MyCompany");
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Lỗi", "Không thể cập nhật công việc.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Tiêu đề công việc</Text>
      <TextInput value={title} onChangeText={setTitle} style={styles.input} />

      <Text style={styles.label}>Mô tả</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        multiline
      />

      <Text style={styles.label}>Địa điểm</Text>
      <TextInput
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />

      <Text style={styles.label}>Lương tối thiểu</Text>
      <TextInput
        value={String(salaryMin)}
        onChangeText={setSalaryMin}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Lương tối đa</Text>
      <TextInput
        value={String(salaryMax)}
        onChangeText={setSalaryMax}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Giờ làm việc</Text>
      <TextInput
        value={String(workingHours)}
        onChangeText={setWorkingHours}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Yêu cầu</Text>
      <TextInput
        value={requirements}
        onChangeText={setRequirements}
        style={styles.input}
        multiline
      />

      <Button title="💾 Cập nhật công việc" onPress={handleUpdate} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
});
