import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import styles from "./style";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";

const { width } = Dimensions.get("window");

const MAX_DESCRIPTION_LENGTH = 120;
const CompanyList = () => {
  const navigation = useNavigation();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(
          "http://10.0.2.2:8000/candidate/companies/"
        );
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const renderItem = ({ item }) => {
    const imagesToShow = item.images ? item.images.slice(0, 3) : [];

    const shortDesc =
      item.description.length > MAX_DESCRIPTION_LENGTH
        ? item.description.slice(0, MAX_DESCRIPTION_LENGTH) + "..."
        : item.description;
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("CompanyDetail", { company: item })}
      >
        <View style={styles.card}>
          <Text style={styles.companyName}>{item.name}</Text>
          <Text style={styles.description}>
            {item.description.length > 120
              ? item.description.slice(0, 120) + "..."
              : item.description}
          </Text>
          <View style={styles.addressContainer}>
            <MaterialIcons name="location-on" size={20} color="#666" />
            <Text style={styles.address}>{item.address}</Text>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={item.images.slice(0, 3)}
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
