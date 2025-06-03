import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, endpoints } from "../../configs/Api";
import { useFocusEffect } from "@react-navigation/native";
import styles from "./Style/style";
import { useNavigation } from "@react-navigation/native";

const MyCompanyScreen = () => {
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem("access_token");
          if (!token) {
            console.log("Chưa đăng nhập.");
            return;
          }

          const companyRes = await authAPI(token).get(
            endpoints["employer_company"]
          );
          setCompany(companyRes.data[0]);

          const jobsRes = await authAPI(token).get(endpoints["my_job"]);
          setJobs(jobsRes.data);
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu:", error);
          setCompany(null);
          setJobs([]);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={(styles.container, { paddingBottom: 100 })}
    >
      {company ? (
        <>
          <Text style={styles.title}>Thông tin công ty:</Text>
          <Text style={styles.info}>Tên: {company.name}</Text>
          <Text style={styles.info}>Địa chỉ: {company.address}</Text>
          <Text style={styles.info}>Website: {company.website}</Text>
          <Text style={styles.info}>Mã số thuế: {company.tax_code}</Text>
          <Text style={styles.info}>Mô tả: {company.description}</Text>

          <Text style={styles.title}>Ảnh môi trường làm việc:</Text>
          <ScrollView horizontal>
            {company.images?.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img.image }}
                style={styles.image}
              />
            ))}
          </ScrollView>

          <View style={{ marginTop: 20 }}>
            <Text style={styles.title}>Danh sách công việc đã đăng:</Text>
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <View key={job.id} style={styles.jobItem}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("Employees_JobDetail", {
                        jobId: job.id,
                      })
                    }
                  >
                    <Text style={styles.jobTitle}>🧾 {job.title}</Text>
                    <Text style={styles.jobDesc} numberOfLines={2}>
                      📄 {job.description}
                    </Text>
                    <Text style={styles.jobDate}>
                      🕒 {new Date(job.created_at).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.actionRow}>
                    <Button
                      title="✏️ Sửa"
                      color="#007bff"
                      onPress={() =>
                        navigation.navigate("EditJobScreen", { job })
                      }
                    />
                    <Button
                      title="🗑️ Xóa"
                      color="#dc3545"
                      onPress={() => {
                        Alert.alert(
                          "Xác nhận",
                          "Bạn có chắc chắn muốn xóa công việc này không?",
                          [
                            {
                              text: "Hủy",
                              style: "cancel",
                            },
                            {
                              text: "Xóa",
                              style: "destructive",
                              onPress: async () => {
                                try {
                                  const token = await AsyncStorage.getItem(
                                    "access_token"
                                  );
                                  await authAPI(token).delete(
                                    `${endpoints["jobs"]}${job.id}/`
                                  );
                                  setJobs((prev) =>
                                    prev.filter((j) => j.id !== job.id)
                                  );
                                } catch (err) {
                                  console.error("Lỗi khi xoá công việc:", err);
                                  alert("❌ Xóa thất bại. Vui lòng thử lại.");
                                }
                              },
                            },
                          ]
                        );
                      }}
                    />
                  </View>
                </View>
              ))
            ) : (
              <Text>Bạn chưa đăng công việc nào.</Text>
            )}
            <Button
              title="➕ Tạo công việc"
              onPress={() => navigation.navigate("CreateJob")}
            />
          </View>
        </>
      ) : (
        <>
          <Text>Bạn chưa có công ty.</Text>
          <Button
            title="Tạo công ty"
            onPress={() => navigation.navigate("CreateCompany")}
          />
        </>
      )}
    </ScrollView>
  );
};

export default MyCompanyScreen;
