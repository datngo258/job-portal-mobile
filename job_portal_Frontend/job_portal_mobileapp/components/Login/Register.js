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
import axios from "axios";
import styles from "./style";
import Apis, { BASE_URL, endpoints } from "../../configs/Api";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import MyStyle from "../../style/MyStyle";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";

import defaultAvatar from "../../style/image/cat_hitler.jpg";
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
  const [errors, setErrors] = useState({});
  const [confirmPassword, setConfirmPassword] = useState("");

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
  const validate = () => {
    let tempErrors = {};

    if (!user.username)
      tempErrors.username = "Tên đăng nhập không được để trống";
    if (!user.email) tempErrors.email = "Email không được để trống";
    else if (!/\S+@\S+\.\S+/.test(user.email))
      tempErrors.email = "Email không hợp lệ";

    if (!user.phone_number)
      tempErrors.phone_number = "Số điện thoại không được để trống";
    else if (!/^\d{9,15}$/.test(user.phone_number))
      tempErrors.phone_number = "Số điện thoại không hợp lệ (9-15 chữ số)";

    if (!user.password) tempErrors.password = "Mật khẩu không được để trống";
    else if (user.password.length < 6)
      tempErrors.password = "Mật khẩu phải ít nhất 6 ký tự";

    if (confirmPassword !== user.password)
      tempErrors.confirmPassword = "Mật khẩu nhập lại không khớp";

    if (!user.user_type) tempErrors.user_type = "Bạn phải chọn vai trò";

    setErrors(tempErrors);

    return Object.keys(tempErrors).length === 0;
  };

  const register = async () => {
    if (!validate()) {
      alert("Vui lòng sửa các lỗi trong form trước khi gửi!");
      return;
    }
    let form = new FormData();

    for (let key in user) {
      if (key === "avatar") {
        let avatarToUse = user.avatar;
        if (!avatarToUse) {
          const asset = Asset.fromModule(defaultAvatar);
          await asset.downloadAsync();
          const localUri = asset.localUri || asset.uri;
          const filename = localUri.split("/").pop();
          const match = /\.(\w+)$/.exec(filename ?? "");
          const type = match ? `image/${match[1]}` : `image/jpeg`;

          avatarToUse = {
            uri: localUri,
            name: filename,
            type: type,
          };
        } else {
          const uri = avatarToUse.uri;
          const filename = uri.split("/").pop();
          const match = /\.(\w+)$/.exec(filename ?? "");
          const type = match ? `image/${match[1]}` : `image/jpeg`;

          avatarToUse = {
            uri: uri,
            name: filename,
            type: type,
          };
        }

        form.append("avatar", {
          uri: avatarToUse.uri,
          name: avatarToUse.name,
          type: avatarToUse.type, // <-- BẮT BUỘC CÓ
        });
      } else {
        form.append(key, user[key]);
      }
    }

    try {
      const res = await axios.post(`${BASE_URL}${endpoints.register}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("🎉 Đăng ký thành công!");
      setTimeout(() => {
        navigation.navigate("Home");
      }, 1500);
    } catch (error) {
      if (error.response) {
        // Nếu server trả lỗi chi tiết, hiển thị từng lỗi một
        if (typeof error.response.data === "object") {
          let serverErrors = "";
          for (const key in error.response.data) {
            serverErrors += `${key}: ${error.response.data[key]}\n`;
          }
          alert(`Lỗi từ server:\n${serverErrors}`);
        } else {
          alert(`Lỗi từ server: ${error.response.data}`);
        }
      } else if (error.request) {
        alert("Không nhận được phản hồi từ server.");
      } else {
        alert(`Lỗi yêu cầu: ${error.message}`);
      }
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
        {errors.username && (
          <Text style={{ color: "red", marginLeft: 10, marginBottom: 5 }}>
            {errors.username}
          </Text>
        )}
        <TextInput
          value={user.email}
          onChangeText={(t) => change("email", t)}
          style={styles.input}
          placeholder="Nhập Email..."
          placeholderTextColor="#888"
        />
        {errors.email && (
          <Text style={{ color: "red", marginLeft: 10, marginBottom: 5 }}>
            {errors.email}
          </Text>
        )}
        <TextInput
          value={user.phone_number}
          onChangeText={(t) => change("phone_number", t)}
          style={styles.input}
          placeholder="Nhập số điện thoại...."
          placeholderTextColor="#888"
        />
        {errors.phone_number && (
          <Text style={{ color: "red", marginLeft: 10, marginBottom: 5 }}>
            {errors.phone_number}
          </Text>
        )}
        <TextInput
          value={user.password}
          onChangeText={(t) => change("password", t)}
          style={styles.input}
          placeholder="Nhập mật khẩu..."
          placeholderTextColor="#888"
          secureTextEntry
        />
        {errors.password && (
          <Text style={{ color: "red", marginLeft: 10, marginBottom: 5 }}>
            {errors.password}
          </Text>
        )}
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          placeholder="Nhập lại mật khẩu..."
          placeholderTextColor="#888"
          secureTextEntry
        />
        {errors.confirmPassword && (
          <Text style={{ color: "red", marginLeft: 10, marginBottom: 5 }}>
            {errors.confirmPassword}
          </Text>
        )}

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
