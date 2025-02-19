import React, { useState } from "react";
import { Form, Button, Input, Space, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { login } from "../utils";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const formRef = React.createRef();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const formInstance = formRef.current;
    setLoading(true);
  
    try {
      await formInstance.validateFields();
      const values = formInstance.getFieldsValue(true);
      
      const { user } = await login(values);
      
      message.success("Login Successfully");
      
      // Call onLogin with the user data if needed
      if (onLogin) {
        onLogin(user.username, values.password);
      }
      
      navigate("/trips");
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div style={{ width: 500, margin: "20px auto" }}>
      <Form ref={formRef}>
        <Form.Item
          name="username"
          rules={[
            {
              required: true,
              message: "Please input your Username!",
            },
          ]}
        >
          <Input
            disabled={loading}
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Username"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "Please input your Password!",
            },
          ]}
        >
          <Input.Password disabled={loading} placeholder="Password" />
        </Form.Item>
      </Form>
      <Space>
        <Button
          onClick={handleLogin}
          disabled={loading}
          shape="round"
          type="primary"
        >
          Log in
        </Button>
        <Button
          onClick={handleRegister}
          disabled={loading}
          shape="round"
          type="primary"
        >
          Register
        </Button>
      </Space>
    </div>
  );
}