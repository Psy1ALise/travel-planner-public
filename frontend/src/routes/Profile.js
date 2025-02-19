import React, { useState } from "react";
import {
  Card,
  Avatar,
  Button,
  Form,
  Input,
  Upload,
  Space,
  message,
  Modal,
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {changePassword, updateAvatar, updateInfo } from "../utils.js"

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [form] = Form.useForm();

  // Mock user data - replace with actual user data later
  const [userData, setUserData] = useState({
    username: localStorage.getItem("username"),
    email: localStorage.getItem("email"),
    avatarUrl: localStorage.getItem("image_url"),
  });

  const handleLogout = () => {
    Modal.confirm({
      title: "Confirm Logout",
      content: "Are you sure you want to log out?",
      onOk: () => {
        // Clear any stored tokens/data
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        localStorage.removeItem("image_url")
        localStorage.removeItem("userId")
        // Navigate to home page
        navigate("/");
        // Refresh the page to reset all states
        window.location.reload();
      },
    });
  };

  const handleUpdateProfile = async (values) => {
    try {
      //transfer data to server
      const response = await updateInfo(values);
      setUserData({ ...userData, ...response });
      message.success("Profile updated successfully");
      //todo: connect server
      setIsEditing(false);
    } catch (error) {
      message.error("Duplicated Username or Email. please try another one");
    }
  };

  const handleChangePassword = async (values) => {
    try {
      await changePassword(values);
      message.success("password changed successfully");
      setIsChanging(false);
    } catch (error) {
      message.error("Failed to change the password, make sure you have type the right original password");
    }
  };

  const handleAvatarUpload = async ({ file }) => {
    try {
      // Get username from localStorage
      const username = localStorage.getItem('username');
      
      // Only proceed if we have both file and username
      if (!file || !username) {
        message.error('Missing file or username');
        return;
      }
  
      // Send to backend
      const response = await updateAvatar(file.originFileObj, username);
      
      // Assuming your backend returns the new image URL in response.imageUrl
      if (response && response.imageUrl) {
        // Update local state
        setUserData({
          ...userData,
          avatarUrl: response.imageUrl
        });
        
        // Save to localStorage
        localStorage.setItem('image_url', response.imageUrl);
        
        message.success('Avatar uploaded successfully');
      }
    } catch (error) {
      message.error('Failed to upload avatar: ' + error.message);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
      <Card>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Space direction="vertical" size="large">
          <Upload
            name="avatar"
            showUploadList={false}
            onChange={handleAvatarUpload}
            customRequest={({ file, onSuccess }) => {
              // This makes the Upload component handle the file locally
              // instead of trying to upload automatically
              setTimeout(() => {
                onSuccess("ok");
              }, 0);
            }}
            beforeUpload={(file) => {
              const isImage = file.type.startsWith('image/');
              if (!isImage) {
                message.error('You can only upload image files!');
              }
              const isLt2M = file.size / 1024 / 1024 < 2;
              if (!isLt2M) {
                message.error('Image must be smaller than 2MB!');
              }
              return isImage && isLt2M;
            }}
          >
              <Space direction="vertical" size="small">
                <Avatar
                    size={100}
                    icon={<UserOutlined />}
                    src={userData.avatarUrl || null}  // Use null as fallback if URL doesn't exist
                />
                <Button icon={<UploadOutlined />}>Change Avatar</Button>
              </Space>
            </Upload>
          </Space>
        </div>

        {isEditing ? (
          <Form
            form={form}
            layout="vertical"
            initialValues={userData}
            onFinish={handleUpdateProfile}
          >
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Save Changes
                </Button>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        ) : isChanging ? (
          <Form
            form={form}
            layout="vertical"
            initialValues={userData}
            onFinish={handleChangePassword}
          >
            <Form.Item
              name="oldPassword"
              label="Original Password"
              rules={[
                { required: true, message: "Please input your old password!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: "Please input your new password" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Save Changes
                </Button>
                <Button onClick={() => setIsChanging(false)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        ) : (
          <div>
            <p>
              <strong>Username:</strong> {userData.username}
            </p>
            <p>
              <strong>Email:</strong> {userData.email}
            </p>

            <Space style={{ marginTop: 24 }}>
              <Button type="primary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
              <Button type="primary" onClick={() => setIsChanging(true)}>
                Change Password
              </Button>
              <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
                Logout
              </Button>
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
}
