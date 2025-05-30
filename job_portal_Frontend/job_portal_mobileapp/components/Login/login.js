import React, { useContext, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import styles from "./style";
import MyConText from "../../configs/MyConText";
import Apis, { authAPI, BASE_URL, endpoints } from "../../configs/Api";
import qs from "qs";
import ApplicationsContext from "../Job/ApplicationsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
const Login = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, dispatch] = useContext(MyConText);
  const [applications, dispatchApplications] = useContext(ApplicationsContext);

  const handleLogin = async () => {
    try {
      const data1 = qs.stringify({
        username: username,
        password: password,
        client_id: "qaWKPoLbth5ZchNNBnMzu6brNdWec9qO1Ve57FL9",
        client_secret:
          "9VQ35JMViBud6jGUF0vgTxKwqsSz6baqw9DdaHP1z1TjR5PFQkWQRavazrgGTjAuo6TDqlsLJvjMFpFN7S1Q15qb7ef25daj8X03UJdeBQOnYqDVkmeFxLT5Uq5CQ8nr",
        grant_type: "password",
      });
      const res = await Apis.post(`${BASE_URL}${endpoints.login}`, data1);

      // lưu token vào trong nhớ tạm
      await AsyncStorage.setItem("access_token", res.data.access_token);
      let user = await authAPI(res.data.access_token).get(
        endpoints["current_user"]
      );
      dispatch({
        type: "login",
        payload: {
          username: user.data.username,
          user_type: user.data.user_type,
          token: res.data.access_token,
        },
      });
      const appsRes = await authAPI(res.data.access_token).get(
        endpoints.applications
      );
      dispatchApplications({
        type: "set_applications",
        payload: appsRes.data,
      });

      navigation.navigate("Home");
    } catch (err) {
      console.error(err);
      alert("Đăng nhập thất bại!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>

      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Nhập tên đăng nhập..."
        placeholderTextColor="#888"
      />

      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Nhập mật khẩu..."
        placeholderTextColor="#888"
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
