import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import styles from "./style";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { authAPI, endpoints } from "../../config/api";
import { authAPI, endpoints } from "../../configs/Api";
const { width } = Dimensions.get("window");
const MAX_DESCRIPTION_LENGTH = 120;

const CompanyList = () => {
  const navigation = useNavigation();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followedCompanies, setFollowedCompanies] = useState([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(
          "http://10.0.2.2:8000/candidate/companies/"
        );
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    const fetchFollowedCompanies = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        console.log(token);
        const res = await authAPI(token).get(endpoints.follow);
        const followedIds = res.data.map((f) => f.company.id);
        setFollowedCompanies(followedIds);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách follow:", err);
      }
    };

    const loadData = async () => {
      await fetchCompanies();
      await fetchFollowedCompanies();
      setLoading(false); // chuyển về đây để cả 2 hoàn tất mới ngừng loading
    };

    loadData();
  }, []);
  // Toggle trạng thái follow/unfollow
  const toggleFollow = async (companyId) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      // const token = await AsyncStorage.getItem("accessToken");
      const res = await authAPI(token).post(endpoints.toggle_follow(companyId));
      console.log(res.data.detail);
      setFollowedCompanies((prev) => {
        if (prev.includes(companyId)) {
          return prev.filter((id) => id !== companyId);
        } else {
          return [...prev, companyId];
        }
      });
    } catch (err) {
      console.error("Lỗi toggle follow:", err.response?.data || err.message);
    }
  };
  const renderItem = ({ item }) => {
    const isFollowed = followedCompanies.includes(item.id);

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("CompanyDetail", { company: item })}
      >
        <View style={styles.card}>
          {/* Nút follow góc trên phải */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              toggleFollow(item.id);
            }}
            style={styles.follow}
          >
            <MaterialIcons
              name={isFollowed ? "favorite" : "favorite-border"}
              size={28}
              color={isFollowed ? "red" : "gray"}
            />
          </TouchableOpacity>

          <Text style={styles.companyName}>{item.name}</Text>
          <Text style={styles.description}>
            {item.description.length > MAX_DESCRIPTION_LENGTH
              ? item.description.slice(0, MAX_DESCRIPTION_LENGTH) + "..."
              : item.description}
          </Text>
          <View style={styles.addressContainer}>
            <MaterialIcons name="location-on" size={20} color="#666" />
            <Text style={styles.address}>{item.address}</Text>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={item.images ? item.images.slice(0, 3) : []}
            keyExtractor={(img) =>
              img.id ? img.id.toString() : Math.random().toString()
            }
            renderItem={({ item: img }) => (
              <Image source={{ uri: img.image }} style={styles.companyImage} />
            )}
            style={{ marginTop: 10 }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <FlatList
      data={companies}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default CompanyList;
