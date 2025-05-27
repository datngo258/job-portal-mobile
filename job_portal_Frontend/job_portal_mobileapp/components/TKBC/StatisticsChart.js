import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { authAPI, endpoints } from "../../configs/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;

export default function StatisticsScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatistics = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const api = authAPI(token);
      const response = await api.get(endpoints.statistics);
      const json = response.data;

      setStats(json);
      setLoading(false);
    } catch (error) {
      console.error("Có lỗi : Error fetching statistics:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: () => "#333",
    style: { borderRadius: 16 },
    propsForBackgroundLines: { stroke: "#e3e3e3" },
  };

  const renderChart = (title, data, color) => (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
        {title}
      </Text>
      <BarChart
        data={{
          labels: stats.months,
          datasets: [{ data }],
        }}
        width={screenWidth - 40}
        height={220}
        chartConfig={{ ...chartConfig, color: () => color }}
        style={{ borderRadius: 16 }}
        fromZero
        showValuesOnTopOfBars
      />
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Không có dữ liệu để hiển thị</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
        Thống kê theo tháng
      </Text>

      {renderChart("Số công việc", stats.jobs, "rgba(0, 122, 255, 0.8)")}
      {renderChart("Số ứng viên", stats.candidates, "rgba(255, 165, 0, 0.8)")}
      {renderChart(
        "Số nhà tuyển dụng",
        stats.employers,
        "rgba(34, 139, 34, 0.8)"
      )}
    </ScrollView>
  );
}
