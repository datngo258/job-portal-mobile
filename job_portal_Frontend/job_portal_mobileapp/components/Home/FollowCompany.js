import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI } from "../../configs/Api"; // hoặc đúng đường dẫn file của bạn

export default function FollowedJobsScreen() {
  const [loading, setLoading] = useState(false);
  const [followData, setFollowData] = useState([]);

  const fetchFollowsAndJobs = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const followRes = await authAPI(token).get("/follows/");
      const follows = followRes.data;

      const jobPromises = follows.map(async (f) => {
        const res = await authAPI(token).get(`/jobs/?company=${f.company.id}`);
        return {
          company: f.company,
          jobs: res.data,
        };
      });

      const fullData = await Promise.all(jobPromises);
      setFollowData(fullData);
    } catch (err) {
      console.error("Lỗi khi lấy follow hoặc jobs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Gọi khi mount component (nếu bạn muốn tự động fetch lúc đầu)
  useEffect(() => {
    fetchFollowsAndJobs();
  }, [fetchFollowsAndJobs]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TouchableOpacity
        onPress={fetchFollowsAndJobs}
        style={{
          backgroundColor: "blue",
          padding: 10,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Làm mới danh sách
        </Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        followData.map((item, index) => (
          <View key={index} style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold" }}>{item.company.name}</Text>
            {item.jobs.map((job, i) => (
              <Text key={i}>- {job.title}</Text>
            ))}
          </View>
        ))
      )}
    </View>
  );
}
