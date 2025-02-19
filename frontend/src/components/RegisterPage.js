import React, { useState } from "react";
import { Form, Button, Input, Space, message } from "antd";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
import { register } from "../utils";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const formRef = React.createRef();
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {

  const formInstance = formRef.current;


    try {
      await formInstance.validateFields();
      setLoading(true);

      await register(formInstance.getFieldsValue(true));
      message.success("Register Successfully");

      navigate("/login"); 

    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {

    navigate("/login");

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
          name="email"
          rules={[
            {
              required: true,
              message: "Please input your Email!",
            },
            {

              type: "email",

              message: "Please input a valid email!",
            },
          ]}
        >
          <Input
            disabled={loading}
            prefix={<MailOutlined className="site-form-item-icon" />}
            placeholder="Email"
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
          onClick={handleRegister}
          disabled={loading}
          shape="round"
          type="primary"
        >
          Register
        </Button>

        <Button onClick={handleBackToLogin} disabled={loading} shape="round">

          Back to Login
        </Button>
      </Space>
    </div>
  );

}

