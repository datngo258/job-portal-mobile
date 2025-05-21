import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Api, { authAPI, BASE_URL, endpoints } from "../../configs/Api";
import {
  View,
  Text,
  Image,
  ScrollView,
  FlatList,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import styles from "./style";

const { width } = Dimensions.get("window");

const CompanyDetail = ({ route, navigation }) => {
  const { company } = route.params;
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        console.log("Token:", token);
        //  const res = await Api.get(endpoints.jobs, {
        //         headers: { Authorization: `Bearer ${token}` },
        //       });
        const response = await Api.get(`${BASE_URL}${endpoints.jobs}`, {
          params: { company_name: company.name },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, [company.name]);

  const renderJobItem = ({ item }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => navigation.navigate("JobDetail", { job: item })}
    >
      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text numberOfLines={2} style={styles.jobDescription}>
        {item.description}
      </Text>
      <View style={{ flexDirection: "row", marginTop: 5 }}>
        <MaterialIcons name="location-on" size={16} color="#666" />
        <Text style={styles.jobLocation}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{company.name}</Text>
      <View style={styles.addressContainer}>
        <MaterialIcons name="location-on" size={24} color="#666" />
        <Text style={styles.address}>{company.address}</Text>
      </View>

      <Text style={[styles.label, { marginTop: 20 }]}>Mô tả công ty:</Text>
      <Text style={styles.text}>{company.description}</Text>

      <Text style={[styles.label, { marginTop: 20 }]}>Mã số thuế:</Text>
      <Text style={styles.text}>{company.tax_code}</Text>

      {company.images && company.images.length > 0 && (
        <>
          <Text style={[styles.label, { marginTop: 20 }]}>Ảnh công ty:</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={company.images}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.image }}
                style={{
                  width: width * 0.6,
                  height: width * 0.4,
                  borderRadius: 10,
                  marginRight: 12,
                }}
                resizeMode="cover"
              />
            )}
            style={{ marginVertical: 10 }}
          />
        </>
      )}

      {company.website && (
        <>
          <Text style={[styles.label, { marginTop: 20 }]}>Website:</Text>
          <Text style={styles.text}>{company.website}</Text>
        </>
      )}

      {company.phone && (
        <>
          <Text style={[styles.label, { marginTop: 20 }]}>Hotline:</Text>
          <Text style={styles.text}>{company.phone}</Text>
        </>
      )}

      {company.email && (
        <>
          <Text style={[styles.label, { marginTop: 20 }]}>Email:</Text>
          <Text style={styles.text}>{company.email}</Text>
        </>
      )}

      {/* Hiển thị danh sách công việc */}
      <Text style={[styles.label, { marginTop: 30 }]}>
        Các công việc của công ty:
      </Text>
      {loadingJobs ? (
        <ActivityIndicator size="large" color="#1976d2" />
      ) : jobs.length === 0 ? (
        <Text style={{ fontStyle: "italic", color: "#666", marginTop: 10 }}>
          Không có công việc nào.
        </Text>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderJobItem}
          scrollEnabled={false} // để ScrollView cuộn thay vì FlatList
          style={{ marginTop: 10 }}
        />
      )}
    </ScrollView>
  );
};

export default CompanyDetail;
