import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { authAPI, endpoints } from "../../configs/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from "react-native";
import React, { useState, useContext } from "react";
import ApplicationsContext from "../Job/ApplicationsContext";

const ApplyJob = ({ route, navigation }) => {
  // const [applications, setApplications] = useContext(ApplicationsContext);
  const [applications, dispatchApplications] = useContext(ApplicationsContext);

  const { job } = route.params;
  const [cv, setCV] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const pickCV = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });
    if (!result.canceled && result.assets?.length > 0) {
      setCV(result.assets[0]);
    }
  };

  const submitApplication = async () => {
    if (!cv || !coverLetter.trim()) {
      Alert.alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("job_id", job.id.toString());
    formData.append("cover_letter", coverLetter);
    formData.append("cv", {
      uri: cv.uri,
      name: cv.name || "cv.pdf",
      type: "application/pdf",
    });

    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await authAPI(token).post(endpoints.applications, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        transformRequest: (data, headers) => data,
      });
      console.log(res.data);
      // ✅ Cập nhật context
      dispatchApplications({
        type: "add_application",
        payload: res.data,
      });

      Alert.alert("Ứng tuyển thành công!");
      navigation.goBack();
    } catch (err) {
      console.error("Server response:", err.response?.data || err.message);
      Alert.alert(
        "Ứng tuyển thất bại",
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Không xác định"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.company}>Công ty: {job.company}</Text>

      <Text style={styles.label}>Thư giới thiệu:</Text>
      <TextInput
        style={styles.input}
        placeholder="Viết lý do ứng tuyển..."
        multiline
        value={coverLetter}
        onChangeText={setCoverLetter}
      />

      <Button title="Chọn CV (PDF)" onPress={pickCV} />
      {cv && <Text style={styles.selectedFile}>Đã chọn: {cv.name}</Text>}

      <View style={styles.mt}>
        {loading ? (
          <ActivityIndicator size="large" color="green" />
        ) : (
          <Button
            title="Gửi đơn ứng tuyển"
            onPress={submitApplication}
            color="green"
          />
        )}
      </View>
    </View>
  );
};

export default ApplyJob;

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { fontWeight: "bold", marginBottom: 8 },
  mt: {
    marginTop: 20,
  },
  input: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 12,
    padding: 8,
    height: 100,
    textAlignVertical: "top",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  company: {
    fontSize: 20,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  selectedFile: {
    marginTop: 10,
    marginBottom: 10,
    color: "blue",
    fontStyle: "italic",
  },
});
