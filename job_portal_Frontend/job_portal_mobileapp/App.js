import React, { useReducer } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Home from "./components/Home/home";
import Login from "./components/Login/login";
import MyConText from "./configs/MyConText";
import MyUserReducers from "./reducers/MyUserReducers";
// import logout from "./components/Login/logout";
import LogoutButton from "./components/Login/logout";
import Register from "./components/Login/Register";
import JobDetail from "./components/Home/DetailJob";
import CompanyList from "./components/Home/Company";
import CompanyDetail from "./components/Home/CompanyDetail";
import Profile from "./components/User/User";
import ApplyJob from "./components/Job/CandidateApp";
import ApplicationsProvider from "./assets/Provider/ApplicationsProvider";
import EditApplication from "./components/User/EditApplication";
import FollowCompany from "./components/Home/FollowCompany";
import CommentJob from "./components/User/CommentJob";
import StatisticsScreen from "./components/TKBC/StatisticsChart";
import MyCompany from "./components/Employer/MyCompany";
import CreateCompany from "./components/Employer/CreateCompany";
import { JobProvider } from "./components/Context/JobContext";
import CreateJob from "./components/Employer/CreateJob";
import EditJobScreen from "./components/Employer/Edit_Job/EditJob";
import Employees_JobDetail from "./components/Employer/Employer_JobDetail";
const Drawer = createDrawerNavigator();
export default function App() {
  const [user, dispatch] = useReducer(MyUserReducers, null);

  return (
    <JobProvider>
      <ApplicationsProvider>
        {" "}
        <MyConText.Provider value={[user, dispatch]}>
          <NavigationContainer>
            <Drawer.Navigator
              initialRouteName="Đăng Nhập"
              screenOptions={{ headerRight: () => <LogoutButton /> }}
            >
              {user === null ? (
                <>
                  <Drawer.Screen name="Đăng Nhập" component={Login} />
                </>
              ) : (
                <>
                  <Drawer.Screen name="Profile" component={Profile} />
                </>
              )}
              <Drawer.Screen
                name="ApplyJob"
                component={ApplyJob}
                options={{
                  title: "Ứng tuyển",
                  drawerItemStyle: { display: "none" },
                }}
              />

              <Drawer.Screen name="Home" component={Home} />
              <Drawer.Screen name="Đăng Ký" component={Register} />
              <Drawer.Screen name="Company" component={CompanyList} />
              <Drawer.Screen
                name="CompanyDetail"
                component={CompanyDetail}
                options={{ drawerItemStyle: { display: "none" } }}
              />
              <Drawer.Screen
                name="JobDetail"
                component={JobDetail}
                options={{ drawerItemStyle: { display: "none" } }}
              />
              <Drawer.Screen
                name="Đăng Xuất"
                component={LogoutButton}
                options={{ drawerItemStyle: { display: "none" } }}
              />
              <Drawer.Screen
                name="EditApplication"
                component={EditApplication}
                options={{
                  title: "Sửa đơn ứng tuyển",
                  drawerItemStyle: { display: "none" },
                }}
              />
              <Drawer.Screen
                name="CommentJob"
                options={{
                  title: "CommentJob",
                  drawerItemStyle: { display: "none" },
                }}
                component={CommentJob}
              />
              {user?.user_type === "candidate" && (
                <Drawer.Screen
                  name="FollowCompany"
                  component={FollowCompany}
                  options={{ title: "Follow" }}
                />
              )}
              {user !== null && (
                <Drawer.Screen
                  name="StatisticsScreen"
                  component={StatisticsScreen}
                  options={{
                    title: "Thống kê && Báo Cáo",
                  }}
                />
              )}
              {user?.user_type === "employer" && (
                <Drawer.Screen
                  name="MyCompany"
                  component={MyCompany}
                  options={{ title: "MyCompany" }}
                />
              )}
              <Drawer.Screen
                name="CreateCompany"
                component={CreateCompany}
                options={{
                  title: "CreateCompany",
                  drawerItemStyle: { display: "none" },
                }}
              />
              <Drawer.Screen
                name="CreateJob"
                component={CreateJob}
                options={{
                  title: "Tạo Công Việc",
                  drawerItemStyle: { display: "none" },
                }}
              />
              <Drawer.Screen
                name="EditJobScreen"
                component={EditJobScreen}
                options={{
                  title: "Sữa Công Việc",
                  drawerItemStyle: { display: "none" },
                }}
              />
              <Drawer.Screen
                name="Employees_JobDetail"
                component={Employees_JobDetail}
                options={{
                  title: "Employees_JobDetail",
                }}
              />
            </Drawer.Navigator>
          </NavigationContainer>
        </MyConText.Provider>
      </ApplicationsProvider>
    </JobProvider>
  );
}
