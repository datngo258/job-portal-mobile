import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { authAPI, endpoints } from "../../configs/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const FollowScreen = () => {
  const [followData, setFollowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchFollowsAndJobs = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const followRes = await authAPI(token).get("/follows/");
        const follows = followRes.data;
        const jobPromises = follows.map(async (f) => {
          const res = await authAPI(token).get(
            `/jobs/?company=${f.company.id}`
          );
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
    };

    fetchFollowsAndJobs();
  }, []);

  const renderItem = ({ item }) => (
    <View
      style={{
        margin: 10,
        padding: 10,
        backgroundColor: "#f2f2f2",
        borderRadius: 8,
      }}
    >
      <Text style={{ fontWeight: "bold", fontSize: 18 }}>
        {item.company.name}
      </Text>
      <Text style={{ marginBottom: 5 }}>{item.company.address}</Text>
      {item.jobs.length === 0 ? (
        <Text>Chưa có công việc nào.</Text>
      ) : (
        item.jobs.map((job) => (
          <TouchableOpacity
            key={job.id}
            onPress={() => navigation.navigate("JobDetail", { job })}
          >
            <Text style={{ padding: 5, color: "#1976d2" }}>• {job.title}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <FlatList
      data={followData}
      keyExtractor={(item) => item.company.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 10 }}
    />
  );
};

export default FollowScreen;
