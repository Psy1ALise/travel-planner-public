import React, { useState, useEffect } from "react";
import {
  Collapse,
  Steps,
  Button,
  Modal,
  Form,
  TimePicker,
  Input,
  message,
  AutoComplete,
  Space,
  Spin,
  InputNumber,
  Empty,
  Typography,
} from "antd";
import {
  PlusOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Panel } = Collapse;

const { Step } = Steps;

const findClosestDate = (dates, targetDate = new Date()) => {
  return dates.reduce((closest, current) => {
    const currentDate = new Date(current);
    const closestDate = new Date(closest);
    const target = new Date(targetDate);
    
    const currentDiff = Math.abs(currentDate - target);
    const closestDiff = Math.abs(closestDate - target);
    
    return currentDiff < closestDiff ? current : closest;
  });
};

export default function DailyItinerary({
  startDate,
  endDate,
  activities,
  onAddActivity,
  onLocationSelect,
  onDaySelect,
  tripData,
  onDeleteActivity,
  onUpdateActivity,
  onActivitySelect,
  getStepDescription,
  updateTripPointHelper,
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [form] = Form.useForm();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeKey, setActiveKey] = useState(['1']);

  // Initialize Google Places service
  const [placesService, setPlacesService] = useState(null);

  useEffect(() => {
    if (window.google && window.google.maps) {
      const service = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
      setPlacesService(service);
    }
  }, []);

  const getDates = (start, end) => {
    const dates = [];
    let current = new Date(start);
    const lastDate = new Date(end);

    while (current <= lastDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const handleLocationSearch = async (value) => {
    if (!value || !placesService) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const autocompleteService = new window.google.maps.places.AutocompleteService();

    const request = {
      input: value,
      types: ["establishment", "geocode"],
      sessionToken: new window.google.maps.places.AutocompleteSessionToken(),
    };

      // 添加位置偏向
    if (tripData?.location) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        const result = await new Promise((resolve, reject) => {
          geocoder.geocode(
            { address: tripData.location },
            (results, status) => {
              if (status === "OK" && results[0]) {
                resolve(results[0].geometry.location);
              } else {
                reject(new Error("Geocoding failed"));
              }
            }
          );
        });

        request.locationBias = {
          center: {
            lat: result.lat(),
            lng: result.lng(),
          },
          radius: 50000, // 50km radius
        };
      } catch (error) {
        console.error("Error setting location bias:", error);
      }
    }

      autocompleteService.getPlacePredictions(
        request,
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            const suggestions = predictions.map((prediction) => ({
              value: prediction.place_id,
              label: prediction.description,
            }));
            setLocationSuggestions(suggestions);
          } else {
            setLocationSuggestions([]);
          }
        }
      );
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocationSuggestions([]);
    }
  };

  const handleLocationSelect = async (placeId, option) => {
    if (!placesService) return null;

    return new Promise((resolve, reject) => {
      placesService.getDetails(
        {
          placeId: placeId,
          fields: ['geometry', 'formatted_address', 'name'],
        },
        (result, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve({
              placeId: placeId,
              latitude: result.geometry.location.lat(),
              longitude: result.geometry.location.lng(),
              address: result.formatted_address,
              name: result.name
            });
          } else {
            reject(new Error("Failed to get place details"));
          }
        }
      );
    });
  };

  const handleAddOrUpdateActivity = async (values) => {
    try {
      if (!selectedLocation) {
        message.error("Please select a location");
        return;
      }

      let locationDetails;
      try {
        locationDetails = await handleLocationSelect(
        selectedLocation.value,
        selectedLocation
      );
      } catch (error) {
        console.error('Failed to get location details:', error);
        message.error("Failed to get location details");
        return;
      }

      if (!locationDetails) {
        message.error("Invalid location data");
        return;
      }

      // Prepare activity data
      const activityData = {
        title: values.title,
        date: selectedDate,
        time: values.time.format("HH:mm"),
        description: values.description || '',
        duration: parseInt(values.duration, 10),
        location: locationDetails,
        locationName: selectedLocation.label
      };

      console.log('Activity data to be saved:', activityData);

      // Add new activity
      const sameDayActivities = activities.filter(
        activity => activity.date === selectedDate
      );
      activityData.visitOrder = sameDayActivities.length + 1;
      await onAddActivity(activityData);
      message.success("Activity added successfully");

      setIsModalVisible(false);
      setIsEditMode(false);
      setEditingActivity(null);
      form.resetFields();
      setSelectedLocation(null);
    } catch (error) {
      console.error("Error processing activity:", error);
      message.error("Failed to add activity");
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      if (!selectedLocation) {
        message.error("Please select a location");
        return;
      }

      let locationDetails;
      if (selectedLocation.custom) {
        // Use existing location data for custom location
        locationDetails = editingActivity.location;
      } else {
        // Get details for new location
        try {
          locationDetails = await handleLocationSelect(
            selectedLocation.value,
            selectedLocation
          );
        } catch (error) {
          console.error('Failed to get location details:', error);
          message.error("Failed to get location details");
          return;
        }
      }

      if (!locationDetails) {
        message.error("Invalid location data");
        return;
      }

      // Prepare update data
      const activityData = {
        title: values.title,
        date: selectedDate,
        time: values.time.format("HH:mm"),
        description: values.description || '',
        duration: parseInt(values.duration, 10),
        location: locationDetails,
        locationName: selectedLocation.label,
        visitOrder: editingActivity ? editingActivity.visitOrder : 1
      };

      if (isEditMode && editingActivity) {
        await updateTripPointHelper(editingActivity.id, activityData);
        message.success("Activity updated successfully");
      } else {
        // Get number of activities for the same day to set visitOrder
        const sameDayActivities = activities.filter(
          activity => activity.date === selectedDate
        );
        activityData.visitOrder = sameDayActivities.length + 1;
        
        await onAddActivity(activityData);
        message.success("Activity added successfully");
      }

      setIsModalVisible(false);
      setIsEditMode(false);
      setEditingActivity(null);
      form.resetFields();
      setSelectedLocation(null);
    } catch (error) {
      console.error("Error processing activity:", error);
      message.error(isEditMode ? "Failed to update activity" : "Failed to add activity");
    }
  };

  const handleEditActivity = (activity) => {
    console.log('Editing activity with data:', activity);
    
    if (!activity.location || !isValidLocation(activity.location)) {
      console.error('Invalid location data in activity:', activity);
      message.error("Invalid location data");
      return;
    }

    setEditingActivity(activity);
    setIsEditMode(true);
    setSelectedDate(activity.date);

    // 设置表单初始值
    form.setFieldsValue({
      title: activity.title,
      location: activity.locationName,
      time: dayjs(activity.time, "HH:mm"),
      duration: activity.duration,
      description: activity.description || ''
    });

    // 设置位置信息
    setSelectedLocation({
      value: activity.location.placeId || 'custom',  // 如果没有 placeId，使用自定义标识
      label: activity.locationName,
      custom: !activity.location.placeId  // 标记是否为自定义位置
    });

    setIsModalVisible(true);
  };

  const handleDeleteActivity = async (activityId) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this activity? This action cannot be undone.',
      okText: 'Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      async onOk() {
    try {
      await onDeleteActivity(activityId);
      message.success("Activity deleted successfully");
    } catch (error) {
      message.error("Failed to delete activity");
    }
      }
    });
  };

  const onChange = (keys) => {
    // 如果点击已经打开的面板，keys 会是空数组
    // 如果点击新面板，keys 会包含新的 key
    setActiveKey(keys);
    
    // 如果所有面板都关闭了（keys 为空数组）
    if (keys.length === 0) {
      onDaySelect(null, []);
      return;
    }
    
    // 如果有新打开的面板
    // 获取最后点击的面板的 key
    const lastClickedKey = keys[keys.length - 1];
    const panelDate = dates[Number(lastClickedKey) - 1];
    const formattedDate = dayjs(panelDate).format('YYYY-MM-DD');
    
    // 获取该日期的活动
    const dayActivities = activities.filter(
      activity => activity.date === formattedDate
    );
    
    // 调用父组件的 onDaySelect 来更新地图
    onDaySelect(formattedDate, dayActivities);
  };

  // 根据日期获取当天的活动
  const getActivitiesByDate = (date) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    return activities.filter(activity => activity.date === formattedDate)
      .sort((a, b) => a.visitOrder - b.visitOrder);
  };

  // 格式化时间显示
  const formatTime = (time) => {
    if (!time) return '';
    // 确保时间格式为 HH:mm
    return dayjs(time, 'HH:mm').format('HH:mm');
  };

  // 格式化持续时间显示
  const formatDuration = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}min` : ''}`;
  };

  const dates = getDates(startDate, endDate);

  // Add back the missing helper functions
  const sortActivitiesByTime = (activities) => {
    return [...activities].sort((a, b) => {
      const timeA = dayjs(a.time, "HH:mm");
      const timeB = dayjs(b.time, "HH:mm");
      return timeA.isBefore(timeB) ? -1 : 1;
    });
  };

  // 修改数据验证函数，添加更详细的日志
  const isValidLocation = (location) => {
    console.log('验证位置数据:', location);
    
    if (!location) {
      console.log('位置数据为空');
      return false;
    }

    // 确保所有必需的属性存在且类型正确
    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);

    // 记录验证详情
    console.log('坐标验证:', {
      latitude: {
        value: latitude,
        isValid: !isNaN(latitude) && latitude !== 0
      },
      longitude: {
        value: longitude,
        isValid: !isNaN(longitude) && longitude !== 0
      }
    });

    // 严格验证
    const isValid = location &&
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      !(latitude === 0 && longitude === 0) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180;

    console.log('位置验证结果:', isValid);
    return isValid;
  };

  // 在组件初始化时设置最近日期的面板为激活状态
  useEffect(() => {
    if (activities.length > 0) {
      const dates = [...new Set(activities.map(a => a.date))];
      const today = new Date();
      const closestDate = findClosestDate(dates, today);
      
      // 找到对应的面板索引
      const panelIndex = dates.findIndex(date => date === closestDate);
      if (panelIndex !== -1) {
        const key = String(panelIndex + 1);
        setActiveKey([key]);
      }
    }
  }, [activities]);

  // 构建 Collapse 的 items
  const collapseItems = dates.map((date, index) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    const dayActivities = getActivitiesByDate(date);
          const sortedActivities = sortActivitiesByTime(dayActivities);

    return {
      key: String(index + 1),
      label: (
        <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
          width: "100%"
        }}>
                  <span>
                    {date.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
              setSelectedDate(formattedDate);
                      setIsModalVisible(true);
                      setIsEditMode(false);
                      setEditingActivity(null);
                      form.resetFields();
                    }}
                  >
                    Add Activity
                  </Button>
                </div>
      ),
      children: dayActivities.length > 0 ? (
              <Steps
                direction="vertical"
          current={-1}
          items={sortedActivities.map((activity, index) => {
            // 获取下一个活动（如果存在）
            const nextActivity = sortedActivities[index + 1];
            
            return {
              key: activity.id,
                  title: (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                  <Typography.Text 
                    strong 
                    style={{ cursor: 'pointer' }}
                    onClick={() => onActivitySelect && onActivitySelect(activity)}
                  >
                    {activity.title}
                  </Typography.Text>
                      <Space>
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditActivity(activity);
                      }}
                        />
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteActivity(activity.id);
                      }}
                        />
                      </Space>
                    </div>
                  ),
              description: getStepDescription ? (
                <div>
                  {React.createElement(getStepDescription, {
                    activity,
                    nextActivity
                  })}
                </div>
              ) : (
                    <div style={{ marginLeft: "8px" }}>
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                          <Space align="center">
                            <ClockCircleOutlined style={{ color: "#1890ff" }} />
                      <Typography.Text type="secondary">
                        {formatTime(activity.time)}
                        {activity.duration && ` (${formatDuration(activity.duration)})`}
                      </Typography.Text>
                          </Space>
                    {activity.location && (
                        <div>
                        <EnvironmentOutlined style={{ color: "#52c41a", marginRight: "8px" }} />
                        <Typography.Text type="secondary">
                          {activity.locationName}
                        </Typography.Text>
                          </div>
                        )}
                    {activity.description && (
                      <Space align="center">
                        <InfoCircleOutlined style={{ color: "#faad14" }} />
                        <Typography.Text type="secondary">
                          {activity.description}
                        </Typography.Text>
                      </Space>
                        )}
                      </Space>
                    </div>
                  ),
                  icon: (
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "#1890ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {index + 1}
                    </div>
                  ),
            };
          })}
        />
      ) : (
        <Empty description="No activities planned for this day" />
      )
    };
  });

  return (
    <div className="daily-itinerary">
      <Collapse
        onChange={onChange}
        activeKey={activeKey}
        style={{ width: '100%' }}
        items={collapseItems}
      />

      <Modal
        title={`${isEditMode ? "Edit" : "Add"} Activity for ${
          selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : ""
        }`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setIsEditMode(false);
          setEditingActivity(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={isEditMode ? handleEditSubmit : handleAddOrUpdateActivity}
          layout="vertical"
          initialValues={{
            duration: 60
          }}
        >
          <Form.Item
            name="title"
            label="Activity Title"
            rules={[{ required: true, message: "Please enter activity title" }]}
          >
            <Input placeholder="Enter activity title" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: "Please select a location" }]}
          >
            <AutoComplete
              options={locationSuggestions}
              onSearch={handleLocationSearch}
              placeholder="Search for a location"
              onSelect={(value, option) => {
                setSelectedLocation(option);
                form.setFieldsValue({
                  location: option.label,
                });
              }}
              onChange={(value) => {
                if (!locationSuggestions.find(s => s.label === value)) {
                  handleLocationSearch(value);
                }
              }}
              value={form.getFieldValue("location")}
            />
          </Form.Item>

          <Form.Item
            name="time"
            label="Time"
            rules={[{ required: true, message: "Please select time" }]}
          >
            <TimePicker
              format="HH:mm"
              minuteStep={15}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration (minutes)"
            rules={[{ 
              required: true, 
              message: "Please enter duration",
              transform: (value) => Number(value)
            }]}
            initialValue={60}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              parser={value => parseInt(value || '60', 10)}
              formatter={value => `${value}`}
            />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Enter activity description" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {isEditMode ? "Update Activity" : "Add Activity"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
