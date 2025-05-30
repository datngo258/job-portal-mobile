import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, endpoints } from "../../configs/Api";
import styles from "./Style/style";

const CreateJob = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [jobType, setJobType] = useState("part_time");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateJob = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập");
        setIsLoading(false);
        return;
      }

      const jobData = {
        title,
        description,
        requirements,
        job_type: jobType,
        location,
        salary_min: parseInt(salaryMin),
        salary_max: parseInt(salaryMax),
        working_hours: workingHours,
      };
      console.log("Dữ liệu gửi lên:", jobData);

      // ✅ Kiểm tra đúng endpoint cho phép POST
      const res = await authAPI(token).post(endpoints["jobs"], jobData);

      Alert.alert("Thành công", "Công việc đã được tạo!");
      navigation.navigate("MyCompany");
    } catch (error) {
      console.error("Lỗi khi tạo công việc:", error);
      Alert.alert("Lỗi", "Không thể tạo công việc. Vui lòng kiểm tra lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Tiêu đề công việc:</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Mô tả:</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Yêu cầu:</Text>
        <TextInput
          style={styles.input}
          value={requirements}
          onChangeText={setRequirements}
        />

        <Text style={styles.label}>Loại công việc:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={jobType}
            onValueChange={(itemValue) => setJobType(itemValue)}
          >
            <Picker.Item label="Part Time" value="part_time" />
            <Picker.Item label="Full Time" value="full_time" />
            <Picker.Item label="Contract" value="contract" />
          </Picker>
        </View>

        <Text style={styles.label}>Địa điểm:</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>Lương tối thiểu (VNĐ):</Text>
        <TextInput
          style={styles.input}
          value={salaryMin}
          onChangeText={setSalaryMin}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Lương tối đa (VNĐ):</Text>
        <TextInput
          style={styles.input}
          value={salaryMax}
          onChangeText={setSalaryMax}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Giờ làm việc:</Text>
        <TextInput
          style={styles.input}
          value={workingHours}
          onChangeText={setWorkingHours}
        />

        <View style={{ marginTop: 20 }}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button title="Tạo công việc" onPress={handleCreateJob} />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};



export default CreateJob;
