// components/Header/LogoutButton.js
import React, { useContext } from "react";
import { Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MyConText from "../../configs/MyConText";

const LogoutButton = () => {
  const [user, dispatch] = useContext(MyConText);
  const navigation = useNavigation();

  const handleLogout = () => {
    dispatch({ type: "logout" });
  };

  if (!user) return null;

  return <Button title="Đăng Xuất" onPress={handleLogout} />;
};

export default LogoutButton;
