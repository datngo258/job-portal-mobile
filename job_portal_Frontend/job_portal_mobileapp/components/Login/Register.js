import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import styles from "./style";
import Apis, { BASE_URL, endpoints } from "../../configs/Api";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import MyStyle from "../../style/MyStyle";

const Register = ({ navigation }) => {
  const [role, setRole] = useState("");
  const [user, setUser] = useState({
    username: "",
    email: "",
    user_type: "",
    phone_number: "",
    password: "",
    avatar: null,
  });

  const change = (field, value) => {
    setUser((current) => {
      return { ...current, [field]: value };
    });
  };

  const picker = async () => {
    let res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (res.status !== "granted") {
      alert("Không có quyền truy cập ảnh!!");
    } else {
      let res = await ImagePicker.launchImageLibraryAsync();
      if (!res.canceled) {
        change("avatar", res.assets[0]);
      }
    }
  };

  const register = async () => {
    let form = new FormData();
    for (let key in user) {
      if (key === "avatar") {
        form.append(key, {
          uri: user.avatar.uri,
          name: user.avatar.fileName || "avatar.jpg",
          type: user.avatar.type || "image/jpeg",
        });
      } else {
        form.append(key, user[key]);
      }
    }
    try {
      let res = await Apis.post(endpoints.register, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // for (let [key, value] of form._parts) {
      //   console.log(`${key}:`, value);
      // }

      navigation.navigate("Home");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Đăng Ký</Text>

        <TextInput
          value={user.username}
          onChangeText={(t) => change("username", t)}
          style={styles.input}
          placeholder="Nhập tên đăng nhập..."
          placeholderTextColor="#888"
        />
        <TextInput
          value={user.email}
          onChangeText={(t) => change("email", t)}
          style={styles.input}
          placeholder="Nhập Email..."
          placeholderTextColor="#888"
        />
        <TextInput
          value={user.phone_number}
          onChangeText={(t) => change("phone_number", t)}
          style={styles.input}
          placeholder="Nhập số điện thoại...."
          placeholderTextColor="#888"
        />
        <TextInput
          value={user.password}
          onChangeText={(t) => change("password", t)}
          style={styles.input}
          placeholder="Nhập mật khẩu..."
          placeholderTextColor="#888"
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Nhập lại mật khẩu..."
          placeholderTextColor="#888"
          secureTextEntry
        />

        {/* Picker cho vai trò */}
        <Text style={{ marginLeft: 10, marginTop: 10 }}>Chọn vai trò:</Text>
        <Picker
          selectedValue={role}
          onValueChange={(itemValue) => {
            setRole(itemValue);
            change("user_type", itemValue); // ✅ cập nhật user.user_type
          }}
          style={{ height: 50, marginHorizontal: 10, marginBottom: 20 }}
        >
          <Picker.Item label="-- Chọn vai trò --" value="" />
          <Picker.Item label="Ứng viên" value="candidate" />
          <Picker.Item label="Nhà tuyển dụng" value="employer" />
        </Picker>

        <TouchableOpacity onPress={picker} style={{ marginBottom: 20 }}>
          <Text> Chọn ảnh đại diện</Text>
        </TouchableOpacity>

        {user.avatar && user.avatar.uri ? (
          <Image style={MyStyle.img} source={{ uri: user.avatar.uri }} />
        ) : null}

        <TouchableOpacity onPress={register} style={styles.button}>
          <Text style={styles.buttonText}>Đăng Ký</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;
