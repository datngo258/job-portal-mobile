import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import MyConText from "../../configs/MyConText";
import { useContext } from "react";
import styles from "./style/styleUser";
export default function CommentJob() {
  const [user] = useContext(MyConText);
  const navigation = useNavigation();
  const route = useRoute();
  // const { application, userType } = route.params;
  const { application, userType, applications, job } = route.params;
  const [selectedAppId, setSelectedAppId] = useState(application?.id || null);

  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  console.log("application nhận được:", application);
  const submitComment = async () => {
    if (!comment.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung bình luận.");
      return;
    }
    if (userType === "employer" && !selectedAppId) {
      Alert.alert("Lỗi", "Vui lòng chọn ứng viên để đánh giá.");
      return;
    }
    try {
      const response = await fetch("http://10.0.2.2:8000/reviews/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          application: userType === "employer" ? selectedAppId : application.id,
          rating: parseInt(rating),
          comment: comment,
          is_employer_review: userType === "employer",
        }),
      });

      if (response.ok) {
        Alert.alert("Thành công", "Đã gửi bình luận.");
        navigation.navigate("Home");
      } else {
        const errorData = await response.json();
        console.error("Lỗi:", errorData);
        Alert.alert("Lỗi", errorData.detail || "Đã xảy ra lỗi.");
      }
    } catch (error) {
      console.error("Lỗi mạng:", error);
      Alert.alert("Lỗi", "Không thể gửi bình luận.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Đánh giá:</Text>
      <Picker
        selectedValue={rating}
        onValueChange={(itemValue) => setRating(itemValue)}
        style={styles.picker}
      >
        {[1, 2, 3, 4, 5].map((val) => (
          <Picker.Item label={`${val} sao`} value={`${val}`} key={val} />
        ))}
      </Picker>

      {/* Commment cho nhà tuyển dụng */}
      {userType === "employer" && (
        <>
          <Text style={styles.label}>Chọn ứng viên để đánh giá:</Text>
          <Picker
            selectedValue={selectedAppId}
            onValueChange={(itemValue) => setSelectedAppId(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="-- Chọn ứng viên --" value={null} />
            {applications
              .filter(
                (app) => app.job?.id === job.id && app.status === "completed"
              )
              .map((app) => (
                <Picker.Item
                  key={app.id}
                  label={app.candidate}
                  value={app.id}
                />
              ))}
          </Picker>
        </>
      )}

      <Text style={styles.label}>Bình luận:</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        value={comment}
        onChangeText={setComment}
        placeholder="Viết bình luận của bạn..."
      />

      <TouchableOpacity style={styles.button} onPress={submitComment}>
        <Text style={styles.buttonText}>Gửi</Text>
      </TouchableOpacity>
    </View>
  );
}
