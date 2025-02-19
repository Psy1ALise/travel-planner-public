import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layout, Input, Space, Menu, Typography } from "antd";
import { UserOutlined, CompassOutlined } from "@ant-design/icons";
import Logo from "../images/logo2.png";

const { Header } = Layout;
const { Text } = Typography;

export default function NavigationBar({ onSearch }) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      key: "trips",
      icon: <CompassOutlined />,
      label: (
        <Link to="/trips">
          <Text strong>My Trips</Text>
        </Link>
      ),
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: (
        <Link to="/profile">
          <Text strong>Profile</Text>
        </Link>
      ),
    },
  ];

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        background: "#fff",
        boxShadow: "0 2px 8px #f0f1f2",
        height: "64px",
      }}
    >
      <div
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          marginRight: "24px",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <Link
          to="/trips"
          style={{
            color: "inherit",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src={Logo}
            alt="Logo"
            style={{
              height: "60px",
              marginRight: "8px",
            }}
          />
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "24px",
              fontStyle: "italic",
              fontWeight: "600",
              background: "linear-gradient(45deg, #2c3e50, #3498db)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            The Travel Planner
          </span>
        </Link>
      </div>

      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{
          marginLeft: "auto",
          border: "none",
          background: "transparent",
        }}
      />
    </Header>
  );
}
