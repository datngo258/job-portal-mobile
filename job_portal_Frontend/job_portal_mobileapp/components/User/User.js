import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { authAPI, endpoints } from "../../configs/Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../User/style/styleUser";
import ApplicationsContext from "../Job/ApplicationsContext";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { Alert } from "react-native";
const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applications, dispatchApplications] = useContext(ApplicationsContext);

  useFocusEffect(
    useCallback(() => {
      const fetchUserAndApplications = async () => {
        try {
          setLoading(true);
          const token = await AsyncStorage.getItem("access_token");
          // Lấy thông tin user
          const userRes = await authAPI(token).get(endpoints["current_user"]);
          setUser(userRes.data);
          // Lấy danh sách ứng tuyển và cập nhật context
          const appsRes = await authAPI(token).get(endpoints["applications"]);
          dispatchApplications({
            type: "set_applications",
            payload: appsRes.data,
          });
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserAndApplications();
    }, [])
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "orange";
      case "accepted":
        return "green";
      case "rejected":
        return "red";
      default:
        return "gray";
    }
  };

  const handleEdit = (application) => {
    navigation.navigate("EditApplication", { application });
    console.log("Sửa đơn ứng tuyển:", application);
  };

  const handleDelete = async (applicationId) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      await authAPI(token).delete(
        `${endpoints["applications"]}${applicationId}/`
      );
      dispatchApplications({
        type: "delete_application",
        payload: applicationId,
      });
      Alert.alert("Thành công", "Đã xóa đơn ứng tuyển.");
    } catch (error) {
      console.error("Lỗi khi xóa đơn ứng tuyển:", error);
      Alert.alert("Lỗi", "Không thể xóa đơn ứng tuyển. Vui lòng thử lại.");
    }
    console.log("Xóa đơn ứng tuyển với ID:", applicationId);
  };
  const handleComment = async (application) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await authAPI(token).get("/jobs/");
      const jobList = res.data;
      console.log("Ứng tuyển job:", application.job);
      const foundJob = jobList.find(
        (j) => j.id === application.job || j.title === application.job?.title
      );
      if (foundJob) {
        navigation.navigate("JobDetail", { job: foundJob });
      } else {
        alert("Không tìm thấy thông tin công việc.");
      }
    } catch (err) {
      console.error("Lỗi khi lấy job:", err);
    }
  };
  const confirmDelete = (applicationId) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa đơn ứng tuyển này?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => handleDelete(applicationId),
        },
      ],
      { cancelable: true }
    );
  };
  const renderApplications = () => (
    <>
      <Text style={styles.label}>Danh sách đơn ứng tuyển:</Text>
      {!applications || applications.length === 0 ? (
        <Text style={styles.value}>Chưa có đơn ứng tuyển nào.</Text>
      ) : (
        applications.map((app, index) => {
          if (!app || typeof app !== "object") return null;
          const jobTitle =
            typeof app.job === "string"
              ? app.job
              : app.job?.title || "Không rõ công việc";
          const status = app.status || "Chưa rõ trạng thái";
          // const jobTitle = (() => {
          //   if (typeof app.job === "string") {
          //     return app.job;
          //   }
          //   if (app.job && typeof app.job === "object") {
          //     if (typeof app.job.title === "string") return app.job.title;
          //     // Nếu có thể app.job là object phức tạp hơn, lấy 1 trường khác hoặc stringify fallback
          //     return JSON.stringify(app.job);
          //   }
          //   return "Không rõ công việc";
          // })();

          return (
            <View key={app.id || index} style={styles.card}>
              <Text style={styles.jobTitle}>{jobTitle}</Text>
              <Text style={[styles.status, { color: getStatusColor(status) }]}>
                Trạng thái: {status}
              </Text>

              {status.toLowerCase() === "pending" && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.buttonEdit}
                    onPress={() => handleEdit(app)}
                  >
                    <Text style={styles.buttonText}>Sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.buttonDelete}
                    onPress={() => confirmDelete(app.id)}
                  >
                    <Text style={styles.buttonText}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              )}
              {status.toLowerCase() === "completed" && (
                <View style={{ marginTop: 10 }}>
                  <TouchableOpacity
                    style={styles.cmt}
                    onPress={() => handleComment(app)}
                  >
                    <Text style={{ color: "white" }}>Bình luận</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })
      )}
    </>
  );

  const renderContent = () => {
    switch (user.user_type) {
      case "admin":
        return (
          <>
            <Text style={styles.role}>Quản trị viên</Text>
            <Text style={styles.label}>
              Username: <Text style={styles.value}>{user.username}</Text>
            </Text>
            <Text style={styles.label}>
              Email: <Text style={styles.value}>{user.email}</Text>
            </Text>
            <Text style={styles.infoNote}>Bạn có quyền quản lý hệ thống.</Text>
          </>
        );
      case "candidate":
        return (
          <>
            <Text style={styles.role}>Ứng viên</Text>
            <Text style={styles.label}>
              Username: <Text style={styles.value}>{user.username}</Text>
            </Text>
            <Text style={styles.label}>
              Email: <Text style={styles.value}>{user.email}</Text>
            </Text>
            <Text style={styles.label}>
              SĐT:{" "}
              <Text style={styles.value}>{user.phone_number || "Chưa có"}</Text>
            </Text>
            <Text style={styles.infoNote}>
              Bạn có thể tìm kiếm và ứng tuyển việc làm.
            </Text>
            {renderApplications()}
          </>
        );
      case "employer":
        return (
          <>
            <Text style={styles.role}>Nhà tuyển dụng</Text>
            <Text style={styles.label}>
              Username: <Text style={styles.value}>{user.username}</Text>
            </Text>
            <Text style={styles.label}>
              Email: <Text style={styles.value}>{user.email}</Text>
            </Text>
            <Text style={styles.label}>
              SĐT:{" "}
              <Text style={styles.value}>{user.phone_number || "Chưa có"}</Text>
            </Text>
            <Text style={styles.infoNote}>
              Bạn có thể đăng và quản lý công việc.
            </Text>
          </>
        );
      default:
        return <Text>Loại người dùng không xác định</Text>;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Không thể tải thông tin người dùng</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ alignItems: "center", padding: 20 }}
    >
      <Image
        source={
          user.avatar
            ? user.avatar.startsWith("http")
              ? { uri: user.avatar }
              : { uri: `https://res.cloudinary.com/dr2mxhzts/${user.avatar}` }
            : require("../../style/image/cat_hitler.jpg")
        }
        style={styles.avatar}
      />
      {renderContent()}
    </ScrollView>
  );
};

export default Profile;
