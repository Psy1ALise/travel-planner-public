import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "antd";
import { useState, useEffect } from "react";
import NavigationBar from "./components/NavigationBar";
import Home from "./routes/Home";
import Trips from "./routes/Trips";
import CreateTrip from "./routes/CreateTrip";
import "antd/dist/reset.css"; 
import TripPlanner from "./routes/TripPlanner";
import Profile from "./routes/Profile";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";

const { Content } = Layout;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [globalSearch, setGlobalSearch] = useState("");

  // Check for token on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      // You could also fetch user data here using the token
      // and update userData state
    }
  }, []);

  const handleLogin = async (username, password) => {
    setUserData({
      username: username,
      // You might want to update this with actual user data
      // from your backend response
    });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUserData(null);
  };

  return (
    <Routes>
      {/* Public routes - No Navbar */}
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <LoginPage onLogin={handleLogin} />
          ) : (
            <Navigate to="/trips" replace />
          )
        }
      />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes - With Navbar */}
      <Route
        element={
          isAuthenticated ? (
            <Layout>
              <NavigationBar onSearch={setGlobalSearch} />
              <Content
                style={{ padding: "24px", minHeight: "calc(100vh - 64px)" }}
              >
                <Routes>
                  <Route
                    path="/trips"
                    element={<Trips searchFilter={globalSearch} />}
                  />
                  <Route path="/trips/create" element={<CreateTrip />} />
                  <Route path="/trips/:tripId/plan" element={<TripPlanner />} />
                  <Route
                    path="/profile"
                    element={
                      <Profile
                        userData={userData}
                        setUserData={setUserData}
                        setIsAuthenticated={setIsAuthenticated}
                        onLogout={handleLogout}
                      />
                    }
                  />
                </Routes>
              </Content>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route path="/trips" element={<Trips searchFilter={globalSearch} />} />
        <Route path="/trips/create" element={<CreateTrip />} />
        <Route path="/trips/:tripId/plan" element={<TripPlanner />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;