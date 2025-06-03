import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
  ToastAndroid,
} from "react-native";
import { authAPI } from "../../configs/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { endpoints } from "../../configs/Api";
import styles from "./admin_style/admin_style";

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      const storedToken = await AsyncStorage.getItem("access_token");
      if (!storedToken) {
        setError("Không tìm thấy token.");
        setLoading(false);
        return;
      }
      setToken(storedToken);
      try {
        const response = await authAPI(storedToken).get(endpoints.register);
        setUsers(response.data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách người dùng.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleDelete = async (userId) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc muốn xóa người dùng này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await authAPI(token).delete(`${endpoints.register}${userId}/`);
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            ToastAndroid.show("Xóa thành công", ToastAndroid.SHORT);
          } catch (err) {
            console.error(err);
            Alert.alert("Lỗi", "Không thể xóa người dùng.");
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
      <Text style={styles.header}>Danh sách người dùng</Text>

      {users.length === 0 ? (
        <Text style={styles.noData}>Không có người dùng nào.</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.avatar && (
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
              )}
              <Text style={styles.name}>{item.username}</Text>
              <Text style={styles.text}>Email: {item.email}</Text>
              <Text style={styles.text}>
                Số điện thoại: {item.phone_number || "Không có"}
              </Text>
              <Text style={styles.text}>Loại người dùng: {item.user_type}</Text>
              <Text style={styles.text}>
                Trạng thái: {item.is_verified ? "Đã xác minh" : "Chưa xác minh"}
              </Text>
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

export default AdminUser;
