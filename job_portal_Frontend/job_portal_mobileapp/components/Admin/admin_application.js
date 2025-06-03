import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
  ToastAndroid,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI } from "../../configs/Api";
import { Ionicons } from "@expo/vector-icons";

const AdminApplication = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const loadApplications = async () => {
    const access_token = await AsyncStorage.getItem("access_token");
    if (!access_token) {
      setError("Không tìm thấy token.");
      setLoading(false);
      return;
    }
    setToken(access_token);
    try {
      const res = await authAPI(access_token).get("/applications/");
      setApplications(res.data);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách đơn ứng tuyển.");
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (appId) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xoá đơn ứng tuyển này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            await authAPI(token).delete(`/applications/${appId}/`);
            setApplications((prev) => prev.filter((app) => app.id !== appId));
            ToastAndroid.show("Đã xoá đơn ứng tuyển", ToastAndroid.SHORT);
          } catch (err) {
            console.error(err);
            Alert.alert("Lỗi", "Không thể xoá đơn.");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "⏳ Chờ xử lý";
      case "approved":
        return "✅ Đã duyệt";
      case "rejected":
        return "❌ Từ chối";
      default:
        return status;
    }
  };

  if (loading)
    return (
      <ActivityIndicator size="large" color="#007bff" style={styles.centered} />
    );

  if (error)
    return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quản lý đơn ứng tuyển</Text>
      {applications.length === 0 ? (
        <Text style={styles.noData}>Không có đơn nào.</Text>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>
                  {item.job?.title || "Không rõ"}
                </Text>
                <TouchableOpacity onPress={() => deleteApplication(item.id)}>
                  <Ionicons name="trash" size={24} color="#ff4d4f" />
                </TouchableOpacity>
              </View>

              <Text style={styles.text}>
                Ứng viên: {item.candidate || "Không rõ"}
              </Text>
              <Text style={styles.text}>
                Trạng thái: {getStatusLabel(item.status)}
              </Text>
              <Text style={styles.text}>
                CV:{" "}
                {item.cv ? (
                  <Text
                    style={styles.link}
                    onPress={() => Linking.openURL(item.cv)}
                  >
                    Xem
                  </Text>
                ) : (
                  "Không có"
                )}
              </Text>
              <Text style={styles.text}>
                Thư xin việc: {item.cover_letter || "Không có"}
              </Text>
              <Text style={styles.text}>
                Ngày ứng tuyển:{" "}
                {new Date(item.applied_at).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
    flex: 1,
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
  },
  link: {
    color: "#007bff",
    textDecorationLine: "underline",
  },
  centered: {
    marginTop: 20,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
  noData: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
});

export default AdminApplication;
