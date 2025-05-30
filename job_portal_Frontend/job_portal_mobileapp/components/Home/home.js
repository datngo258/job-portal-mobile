import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import Api, { authAPI, endpoints } from "../../configs/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyConText from "../../configs/MyConText";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import JobDetail from "./DetailJob";
dayjs.extend(relativeTime);
import "dayjs/locale/vi";
dayjs.locale("vi");
dayjs.extend(relativeTime);
export default function Home({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, dispatch] = useContext(MyConText);
  // console.log(user);
  // Các state tìm kiếm
  const [jobType, setJobType] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [location, setLocation] = useState("");
  // Lấy danh sách job từ API
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      const res = await Api.get(endpoints.jobs, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
      setFilteredJobs(res.data);
    } catch (e) {
      console.error(e);
      setError("Không thể lấy dữ liệu công việc.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Hàm lọc job theo điều kiện
  const filterJobs = () => {
    let filtered = jobs.filter((job) => {
      const matchesJobType =
        jobType.trim() === "" ||
        job.job_type.toLowerCase().includes(jobType.trim().toLowerCase());

      const matchesWorkingHours =
        workingHours.trim() === "" ||
        job.working_hours.toString().includes(workingHours.trim());

      const matchesSalaryMin =
        salaryMin.trim() === "" || job.salary_min >= Number(salaryMin);

      const matchesSalaryMax =
        salaryMax.trim() === "" || job.salary_max <= Number(salaryMax);

      const matchesLocation =
        location.trim() === "" ||
        job.location.toLowerCase().includes(location.trim().toLowerCase());

      return (
        matchesJobType &&
        matchesWorkingHours &&
        matchesSalaryMin &&
        matchesSalaryMax &&
        matchesLocation
      );
    });

    setFilteredJobs(filtered);
  };

  // Khi thay đổi các input tìm kiếm, gọi filter
  useEffect(() => {
    filterJobs();
  }, [jobType, workingHours, salaryMin, salaryMax, location]);

  // render 1 item job

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => navigation.navigate("JobDetail", { job: item })}
    >
      <View style={styles.jobCard}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text>Loại công việc: {item.job_type}</Text>
        <Text>Địa điểm: {item.location}</Text>
        <Text>
          Mức lương: {item.salary_min} - {item.salary_max}
        </Text>
        <Text>Giờ làm việc: {item.working_hours}</Text>
        <Text style={styles.createdAt}>
          Đăng cách đây {dayjs().diff(dayjs(item.created_at), "day")} ngày
        </Text>

        {/* Nếu là ứng viên thì show nút Ứng tuyển */}
      </View>
    </TouchableOpacity>
  );

  if (loading)
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );

  if (error)
    return (
      <View style={styles.container}>
        <Text style={{ color: "red" }}>{error}</Text>
        <TouchableOpacity onPress={fetchJobs} style={styles.reloadBtn}>
          <Text style={{ color: "white" }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      {/* Phần tìm kiếm */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.searchContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Kiểu công việc"
          value={jobType}
          onChangeText={setJobType}
        />
        <TextInput
          style={styles.input}
          placeholder="Số giờ làm"
          value={workingHours}
          onChangeText={setWorkingHours}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Lương min"
          value={salaryMin}
          onChangeText={setSalaryMin}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Lương max"
          value={salaryMax}
          onChangeText={setSalaryMax}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Địa điểm"
          value={location}
          onChangeText={setLocation}
        />
      </ScrollView>

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
        ListEmptyComponent={<Text>Không có công việc phù hợp.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  searchContainer: {
    maxHeight: 50,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  input: {
    height: 40,
    width: 140,
    marginRight: 10,
    paddingHorizontal: 10,
    borderColor: "#aaa",
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  jobCard: {
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    elevation: 2,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  createdAt: {
    marginTop: 8,
    fontStyle: "italic",
    color: "#666",
    textAlign: "right",
  },
  reloadBtn: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
    alignItems: "center",
  },
  applyBtn: {
    marginTop: 12,
    backgroundColor: "#28a745",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  applyBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
