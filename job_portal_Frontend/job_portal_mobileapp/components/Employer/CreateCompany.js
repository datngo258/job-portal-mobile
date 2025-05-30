import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import styles from "./Style/style";
import * as ImagePicker from "expo-image-picker";
import { authAPI, endpoints } from "../../configs/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CreateCompany = ({ navigation }) => {
  const [name, setName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const selected = result.assets || [result]; // Handle single/multiple
      setImages([...images, ...selected]);
    }
  };

  const handleCreate = async () => {
    if (!name || !taxCode || !description || !address || !website) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (images.length < 3) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất 3 ảnh.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("tax_code", taxCode);
    formData.append("description", description);
    formData.append("address", address);

    let formattedWebsite = website;
    if (!website.startsWith("http://") && !website.startsWith("https://")) {
      formattedWebsite = "https://" + website;
    }
    formData.append("website", formattedWebsite);

    images.forEach((img, index) => {
      formData.append("images", {
        uri: img.uri,
        type: "image/jpeg",
        name: `image_${index}.jpg`,
      });
    });

    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await authAPI(token).post(
        endpoints["employer_company"],
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert("Thành công", "Đã tạo công ty.");
      navigation.navigate("MyCompany");
    } catch (err) {
      console.error("Lỗi tạo công ty:", err);
      const errData = err.response?.data;
      if (errData?.tax_code) {
        Alert.alert("Lỗi", "Mã số thuế đã tồn tại.");
      } else if (errData?.website) {
        Alert.alert(
          "Lỗi",
          "Website không hợp lệ. Nhập đầy đủ dạng https://..."
        );
      } else {
        Alert.alert("Lỗi", "Không thể tạo công ty.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Tên công ty</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Mã số thuế</Text>
      <TextInput
        style={styles.input}
        value={taxCode}
        onChangeText={setTaxCode}
      />

      <Text style={styles.label}>Mô tả</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Địa chỉ</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>Website</Text>
      <TextInput
        style={styles.input}
        value={website}
        onChangeText={setWebsite}
      />

      <Button title="Chọn ảnh" onPress={pickImages} />
      <ScrollView horizontal style={{ marginVertical: 10 }}>
        {images.map((img, idx) => (
          <Image
            key={idx}
            source={{ uri: img.uri }}
            style={{ width: 100, height: 100, marginRight: 10 }}
          />
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <Button title="Tạo công ty" onPress={handleCreate} />
      )}
    </ScrollView>
  );
};

export default CreateCompany;
