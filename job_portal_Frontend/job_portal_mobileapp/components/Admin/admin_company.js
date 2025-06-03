import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI } from "../../configs/Api";
import { Button } from "react-native";
import styles from "./admin_style/admin_style";

const AdminCompany = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const storedToken = await AsyncStorage.getItem("access_token");
      if (!storedToken) {
        setError("Không tìm thấy token.");
        setLoading(false);
        return;
      }
      setToken(storedToken);
      try {
        const response = await authAPI(storedToken).get("/companies/");
        setCompanies(response.data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách công ty.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = (id) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc muốn xóa công ty này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await authAPI(token).delete(`/companies/${id}/`);
            setCompanies((prev) => prev.filter((c) => c.id !== id));
            Alert.alert("Thành công", "Đã xóa công ty.");
          } catch (err) {
            console.error("DELETE ERROR:", err);
            Alert.alert("Lỗi", "Xóa công ty thất bại.");
          }
        },
      },
    ]);
  };

  const handleApprove = async (id, approve = true) => {
    try {
      await authAPI(token).patch(
        `/companies/${id}/${approve ? "approve" : "disapprove"}/`
      );
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_approved: approve } : c))
      );
      Alert.alert(
        "Thành công",
        approve ? "Đã duyệt công ty." : "Đã từ chối công ty."
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái.");
    }
  };

  const openWebsite = (url) => {
    if (!url.startsWith("http")) url = `http://${url}`;
    Linking.openURL(url);
  };

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Danh sách công ty</Text>

      {companies.length === 0 ? (
        <Text>Không có công ty nào.</Text>
      ) : (
        <FlatList
          data={companies}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.name}</Text>
              <Text>Mã số thuế: {item.tax_code || "Không có"}</Text>
              <Text>Địa chỉ: {item.address}</Text>
              <Text>Người tạo: {item.user}</Text>
              {item.website ? (
                <TouchableOpacity onPress={() => openWebsite(item.website)}>
                  <Text style={styles.websiteLink}>{item.website}</Text>
                </TouchableOpacity>
              ) : null}
              <Text>
                Trạng thái:{" "}
                <Text
                  style={{
                    color: item.is_approved ? "green" : "orange",
                    fontWeight: "bold",
                  }}
                >
                  {item.is_approved ? "Đã duyệt" : "Chưa duyệt"}
                </Text>
              </Text>

              <View style={styles.buttonRow}>
                <Button
                  title="Duyệt"
                  color="green"
                  onPress={() => handleApprove(item.id, true)}
                />
                <Button
                  title="Từ chối"
                  color="orange"
                  onPress={() => handleApprove(item.id, false)}
                />
                <Button
                  title="Xóa"
                  color="red"
                  onPress={() => handleDelete(item.id)}
                />
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default AdminCompany;
