import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import styles from "./admin_style/admin_style";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI } from "../../configs/Api";
import { Ionicons } from "@expo/vector-icons";

const AdminReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  const loadReviews = async () => {
    const access_token = await AsyncStorage.getItem("access_token");
    if (!access_token) return;
    setToken(access_token);
    try {
      const res = await authAPI(access_token).get("/reviews/");
      setReviews(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi", "Không thể tải danh sách đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xoá đánh giá này?", [
      { text: "Huỷ" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            await authAPI(token).delete(`/reviews/${id}/`);
            setReviews((prev) => prev.filter((r) => r.id !== id));
            Alert.alert("Thành công", "Đã xoá đánh giá.");
          } catch (err) {
            console.error(err);
            Alert.alert("Lỗi", "Không thể xoá đánh giá.");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 30 }} />;

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>
          {item.is_employer_review ? "Nhà tuyển dụng" : "Ứng viên"} đánh giá
        </Text>
        <TouchableOpacity onPress={() => deleteReview(item.id)}>
          <Ionicons name="trash" size={22} color="#ff4d4f" />
        </TouchableOpacity>
      </View>
      <Text style={styles.text}>Công việc: {item.job_title}</Text>
      <Text style={styles.text}>Công ty: {item.company_name}</Text>
      <Text style={styles.text}>Ứng viên: {item.candidate_username}</Text>
      <Text style={styles.text}>Số sao: {item.rating}/5</Text>
      <Text style={styles.text}>Bình luận: {item.comment || "Không có"}</Text>
      <Text style={styles.text}>
        Ngày: {new Date(item.created_at).toLocaleDateString("vi-VN")}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quản lý đánh giá</Text>
      {reviews.length === 0 ? (
        <Text style={styles.noData}>Không có đánh giá nào.</Text>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default AdminReview;
