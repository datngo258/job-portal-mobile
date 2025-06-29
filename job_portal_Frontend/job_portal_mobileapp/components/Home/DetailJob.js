import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import styles from "./style";
import React, { useContext, useEffect, useState } from "react";
import MyConText from "../../configs/MyConText";
import ApplicationsContext from "../../components/Job/ApplicationsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { authAPI, endpoints } from "../../configs/Api";
dayjs.extend(relativeTime);

export default function JobDetail({ route, navigation }) {
  const { job } = route.params;
  const [user] = useContext(MyConText);
  const [applications] = useContext(ApplicationsContext);
  const [canComment, setCanComment] = useState(false);
  const [comments, setComments] = useState([]);
  const [completedApp, setCompletedApp] = useState(null);
  const [employerComments, setEmployerComments] = useState([]);
  useFocusEffect(
    React.useCallback(() => {
      const fetchComments = async () => {
        const token = await AsyncStorage.getItem("access_token");
        try {
          const res = await authAPI(token).get(endpoints.reviews);
          const data = res.data;

          const jobComments = data.filter(
            (r) => Number(r.job_id) === Number(job.id) && !r.is_employer_review
          );
          setComments(jobComments);

          const empComments = data.filter(
            (r) => Number(r.job_id) === Number(job.id) && r.is_employer_review
          );
          setEmployerComments(empComments);
          const matchedApp = applications.find(
            (app) =>
              Number(app.job?.id) === Number(job.id) &&
              app.status === "completed" &&
              app.candidate === user?.username
          );

          if (matchedApp) {
            setCanComment(true);
            setCompletedApp(matchedApp);
          } else {
            setCanComment(false);
            setCompletedApp(null);
          }

          if (user.id === job.creator_id) {
            setCanComment(true);
          }
        } catch (error) {
          console.error("Lỗi lấy bình luận:", error);
        }
      };

      fetchComments();
    }, [job.id, applications, user?.id])
  );
  useEffect(() => {
    const fetchComments = async () => {
      const token = await AsyncStorage.getItem("access_token");
      try {
        const res = await authAPI(token).get(endpoints.reviews);
        const data = res.data;
        const jobComments = data.filter(
          (r) => Number(r.job_id) === Number(job.id) && !r.is_employer_review
        );
        setComments(jobComments);

        // Kiểm tra xem user đã có ứng tuyển hoàn thành cho job này chưa
        const matchedApp = applications.find(
          (app) =>
            Number(app.job?.id) === Number(job.id) &&
            app.status === "completed" &&
            app.candidate === user?.username
        );

        if (matchedApp) {
          setCanComment(true);
          setCompletedApp(matchedApp);
        } else {
          setCanComment(false);
          setCompletedApp(null);
        }
        if (user.id === job.creator_id) {
          console.log("có quyền comment ");
          setCanComment(true);
        }
      } catch (error) {
        console.error("Lỗi lấy bình luận:", error);
      }
    };

    fetchComments();
  }, [job.id, applications, user?.id]);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.company}>Công ty: {job.company}</Text>

      <Text style={styles.label}>Mô tả:</Text>
      <Text style={styles.text}>{job.description}</Text>

      <Text style={styles.label}>Yêu cầu:</Text>
      <Text style={styles.text}>{job.requirements}</Text>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Loại công việc:</Text>
          <Text style={styles.text}>{job.job_type}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Địa điểm:</Text>
          <Text style={styles.text}>{job.location}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Mức lương:</Text>
          <Text style={styles.text}>
            {job.salary_min} - {job.salary_max}
          </Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Giờ làm việc:</Text>
          <Text style={styles.text}>{job.working_hours}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Trạng thái:</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: job.is_active ? "green" : "red" },
              ]}
            />
            <Text style={styles.text}>
              {job.is_active ? "Đang hoạt động" : "Ngưng hoạt động"}
            </Text>
          </View>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Đã đăng tuyển:</Text>
          <Text style={styles.text}>{dayjs(job.created_at).fromNow()}</Text>
        </View>
      </View>

      <Text style={styles.label1}>Bình luận của ứng viên:</Text>
      {comments.length > 0 ? (
        comments.map((c) => (
          <View
            key={c.id}
            style={{
              padding: 10,
              backgroundColor: "#f5f5f5",
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
              {c.candidate_username || "Ẩn danh"}:
            </Text>

            {/* Hiển thị rating dạng sao */}
            <Text style={{ marginBottom: 5 }}>
              {"⭐".repeat(c.rating || 0)}{" "}
            </Text>

            <Text style={styles.text}>{c.comment}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.text}>Chưa có bình luận nào.</Text>
      )}
      <Text style={styles.label1}>Đánh giá từ nhà tuyển dụng:</Text>
      {employerComments.length > 0 ? (
        employerComments.map((c) => (
          <View
            key={c.id}
            style={{
              padding: 10,
              backgroundColor: "#e0f7fa",
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
              Nhà tuyển dụng đánh giá ứng viên:{" "}
              <Text style={{ color: "#0077cc" }}>
                {c.candidate_username || "Ẩn danh"}
              </Text>
            </Text>

            {/* Hiển thị rating dạng sao */}
            <Text style={{ marginBottom: 5 }}>
              {"⭐".repeat(c.rating || 0)}{" "}
            </Text>

            <Text style={styles.text}>{c.comment}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.text}>Chưa có đánh giá từ nhà tuyển dụng.</Text>
      )}
      {/* Nút Viết bình luận nếu đủ điều kiện */}
      {canComment && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            navigation.navigate("CommentJob", {
              application: user.user_type === "candidate" ? completedApp : null,
              job,
              userType: user?.user_type,
              applications, // truyền full danh sách để nhà tuyển dụng chọn
            });
          }}
        >
          <Text style={styles.buttonText}>Viết bình luận</Text>
        </TouchableOpacity>
      )}

      {/* Nút Ứng tuyển */}
      {user?.user_type === "candidate" && (
        <TouchableOpacity
          style={styles.applyBtn}
          onPress={() => navigation.navigate("ApplyJob", { job })}
        >
          <Text style={styles.applyBtnText}>Ứng tuyển</Text>
        </TouchableOpacity>
      )}

      {/* Nút Quay về Home */}
      <TouchableOpacity
        style={styles.btnBack}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.btnText}>Quay về Home</Text>
      </TouchableOpacity>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}
