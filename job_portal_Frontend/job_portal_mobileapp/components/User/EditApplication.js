import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { authAPI, endpoints } from "../../configs/Api";
import ApplicationsContext from "../Job/ApplicationsContext";

const EditApplication = ({ route, navigation }) => {
  const { application } = route.params;
  const [coverLetter, setCoverLetter] = useState(
    application.cover_letter || ""
  );
  const [cvFile, setCvFile] = useState(null); // Lưu file CV
  const [loading, setLoading] = useState(false);
  const [applications, dispatchApplications] = useContext(ApplicationsContext);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result?.assets?.length > 0) {
        const file = result.assets[0];
        setCvFile({
          uri: file.uri,
          name: file.name,
          size: file.size,
          type: getMimeType(file.name),
        });
        console.log("Đã chọn file:", file);
      } else if (result.type === "success") {
        // fallback nếu không dùng assets
        setCvFile(result);
        console.log("Đã chọn file (fallback):", result);
      } else {
        console.log("Người dùng hủy chọn file");
      }
    } catch (err) {
      console.error("Lỗi chọn file:", err);
    }
  };
  const getMimeType = (filename) => {
    const extension = filename.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return "application/pdf";
      case "doc":
        return "application/msword";
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      default:
        return "application/octet-stream";
    }
  };

  const handleSave = async () => {
    if (!cvFile && !application.cv) {
      Alert.alert("Thông báo", "Vui lòng chọn file CV.");
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("access_token");

      const formData = new FormData();
      formData.append("cover_letter", coverLetter);

      if (cvFile) {
        formData.append("cv", {
          uri: cvFile.uri,
          name: cvFile.name || "cv.pdf",
          type: getMimeType(cvFile.name || "cv.pdf"),
        });
      }
      for (let pair of formData._parts) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      const response = await authAPI(token).patch(
        `${endpoints["applications"]}${application.id}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      dispatchApplications({
        type: "update_application",
        payload: response.data,
      });

      Alert.alert("Thành công", "Đơn ứng tuyển đã được cập nhật");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật đơn ứng tuyển");
      console.error("Lỗi cập nhật:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Công việc: {application.job}</Text>
      <Text style={styles.title}>
        Công ty: {application.job_company || "Không rõ"}
      </Text>

      <Text style={styles.label}>Thư xin việc</Text>
      <TextInput
        style={styles.textInput}
        multiline
        numberOfLines={4}
        value={coverLetter}
        onChangeText={setCoverLetter}
      />

      <Text style={styles.label}>CV</Text>
      <TouchableOpacity onPress={pickDocument} style={styles.pickButton}>
        <Text style={styles.pickButtonText}>
          {cvFile ? cvFile.name : "Chọn file CV từ máy"}
        </Text>
      </TouchableOpacity>

      <Button title="Lưu thay đổi" onPress={handleSave} />
    </View>
  );
};

export default EditApplication;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  pickButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#eee",
  },
  pickButtonText: {
    color: "#333",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
