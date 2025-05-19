  import React, { useReducer } from "react";
  import { NavigationContainer } from "@react-navigation/native";
  import { createDrawerNavigator } from "@react-navigation/drawer";
  import Home from "./components/Home/home";
  import Login from "./components/Login/login";
  import MyConText from "./configs/MyConText";
  import MyUserReducers from "./reducers/MyUserReducers";
  import logout from "./components/Login/logout";
import Register from "./components/Login/Register";

  const Drawer = createDrawerNavigator();
  export default function App() {
    const [user, dispatch] = useReducer(MyUserReducers, null);

    return (
      <MyConText.Provider value={[user, dispatch]}>
        <NavigationContainer>
          <Drawer.Navigator
            initialRouteName="Đăng Nhập"
            screenOptions={{ headerRight: logout }}
          >
            <Drawer.Screen name="Home" component={Home} />
            <Drawer.Screen name="Đăng Ký" component={Register} />

            {user === null ? (
              <>
                <Drawer.Screen name="Đăng Nhập" component={Login} />
              </>
            ) : (
              <>
                <Drawer.Screen
                  name={`Xin chào, ${user.username}`}
                  component={Home}
                />
              </>
            )}
            <Drawer.Screen
              name="Đăng Xuất"
              component={logout}
              options={{ drawerItemStyle: { display: "none" } }}
            />
          </Drawer.Navigator>
        </NavigationContainer>
      </MyConText.Provider>
    );
  }
