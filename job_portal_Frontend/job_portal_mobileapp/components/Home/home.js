// // import React from 'react';
// // import { View, Text } from "react-native";
// // import MyStyle from "../../style/MyStyle";
// // import style from "./style";
// // import { NavigationContainer } from '@react-navigation/native';

// // const Home = () => {
// //     return (
// //         <View style={MyStyle.container}>
// //             <Text style={style.subject}>
// //                 Ngô Đình Đạt
// //             </Text>
// //         </View>
// //     );
// // };

// // export default Home;
// import React, { useEffect, useState } from "react";
// import { View, Text, FlatList, StyleSheet } from "react-native";
// import { getJobs } from "../../configs/Api"; // đường dẫn đúng với cấu trúc của bạn

// const JobListScreen = () => {
//   const [jobs, setJobs] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       const data = await getJobs();
//       setJobs(data);
//     };
//     fetchData();
//   }, []);

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <Text style={styles.title}>{item.title}</Text>
//       <Text>Loại công việc: {item.job_type}</Text>
//       <Text>Địa điểm: {item.location}</Text>
//       <Text>
//         Lương: {item.salary_min} - {item.salary_max}
//       </Text>
//       <Text>Giờ làm việc: {item.working_hours}</Text>
//     </View>
//   );

//   return (
//     <FlatList
//       data={jobs}
//       keyExtractor={(item) => item.id.toString()}
//       renderItem={renderItem}
//       contentContainerStyle={styles.container}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//   },
//   card: {
//     backgroundColor: "#f0f0f0",
//     padding: 12,
//     marginBottom: 12,
//     borderRadius: 8,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
// });

// export default JobListScreen;
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // chiếm full màn hình
    justifyContent: "center", // căn giữa theo chiều dọc
    alignItems: "center", // căn giữa theo chiều ngang
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
