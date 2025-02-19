import React, { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Layout, Typography, Space, message, Spin, Form } from "antd";
import { GoogleMap, useLoadScript, InfoWindowF, MarkerF, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import DailyItinerary from "../components/DailyItinerary";
import { getTripDetails, createTripPoint, getTripPoints, updateTripPoint, deleteTripPoint } from "../utils";
import dayjs from "dayjs";
import { ClockCircleOutlined, InfoCircleOutlined, CarOutlined, EnvironmentOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Title } = Typography;

const libraries = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "8px",
  marginBottom: "2rem",
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  scaleControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
  controlSize: 28,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

// 在文件开头添加新的函数
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

// 修改计算地图边界的函数
const calculateBounds = (activities) => {
  if (!activities || activities.length === 0) return null;
  
  const bounds = new window.google.maps.LatLngBounds();
  let hasValidPoints = false;
  
  activities.forEach(activity => {
    const lat = Number(activity.location.latitude);
    const lng = Number(activity.location.longitude);
    
    if (lat && lng && !(lat === 0 && lng === 0)) {
      bounds.extend(new window.google.maps.LatLng(lat, lng));
      hasValidPoints = true;
    }
  });
  
  return hasValidPoints ? bounds : null;
};

export default function TripPlanner() {
  const { tripId } = useParams();
  const [activities, setActivities] = useState([]);
  const [mapCenter, setMapCenter] = useState(null);
  const [tripData, setTripData] = useState(null);
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDayActivities, setSelectedDayActivities] = useState([]);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form] = Form.useForm();
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [directions, setDirections] = useState(null);
  const directionsRendererRef = React.useRef(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // 首先定义 updateMapMarkers 函数
  const updateMapMarkers = useCallback(
    async (activities) => {
      // 确保清除现有路线
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
      setDirections(null);

      // 如果没有地图或活动，直接返回
      if (!map || !activities || activities.length === 0) {
        return;
      }

      // 调整地图以显示所有标记点
      const bounds = calculateBounds(activities);
      if (bounds) {
        // 如果只有一个活动点，设置固定的缩放级别
        if (activities.length === 1) {
          const activity = activities[0];
          map.setCenter({
            lat: Number(activity.location.latitude),
            lng: Number(activity.location.longitude)
          });
          map.setZoom(15);  // 缩放级别15大约对应500m比例尺
        } else {
          // 添加更大的边距
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();
          
          // 扩展边界，增加到 30% 的边距
          const latPadding = (ne.lat() - sw.lat()) * 0.3;
          const lngPadding = (ne.lng() - sw.lng()) * 0.3;
          
          bounds.extend(new window.google.maps.LatLng(ne.lat() + latPadding, ne.lng() + lngPadding));
          bounds.extend(new window.google.maps.LatLng(sw.lat() - latPadding, sw.lng() - lngPadding));
          
          map.fitBounds(bounds);
          
          // 移除最大缩放限制，让地图自动决定最佳缩放级别
          window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
            const currentZoom = map.getZoom();
            // 只有当缩放级别太小（地图太远）时才调整
            if (currentZoom < 10) {
              map.setZoom(10);
            }
          });
        }
      }

      if (activities.length >= 2) {
        // 按时间排序
        const sortedActivities = activities.sort((a, b) => {
          const timeA = new Date(`1970/01/01 ${a.time}`);
          const timeB = new Date(`1970/01/01 ${b.time}`);
          return timeA - timeB;
        });

        // 计算路线
        try {
          const directionsService = new window.google.maps.DirectionsService();
          const waypoints = sortedActivities.slice(1, -1).map(activity => ({
            location: { lat: activity.location.latitude, lng: activity.location.longitude },
            stopover: true
          }));

          const result = await new Promise((resolve, reject) => {
            directionsService.route(
              {
                origin: {
                  lat: sortedActivities[0].location.latitude,
                  lng: sortedActivities[0].location.longitude
                },
                destination: {
                  lat: sortedActivities[sortedActivities.length - 1].location.latitude,
                  lng: sortedActivities[sortedActivities.length - 1].location.longitude
                },
                waypoints,
                travelMode: window.google.maps.TravelMode.DRIVING,
                optimizeWaypoints: false
              },
              (response, status) => {
                if (status === "OK") {
                  resolve(response);
                } else {
                  reject(new Error(`Failed to get route: ${status}`));
                }
              }
            );
          });

          setDirections(result);
        } catch (error) {
          console.error("Error calculating route:", error);
          setDirections(null);
          if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(null);
            directionsRendererRef.current = null;
          }
        }
      }
    },
    [map]
  );

  // 然后定义 handleDaySelect 函数
  const handleDaySelect = useCallback(
    (date, activities) => {
      // 清除之前的状态
      setDirections(null);
      setSelectedMarker(null);
      setSelectedDayActivities([]);

      // 如果没有日期或活动，直接返回
      if (!date || !activities || activities.length === 0) {
        // 确保在关闭面板时重置地图状态
        if (map) {
          // 如果有地图中心点，重置到初始位置和缩放级别
          if (mapCenter) {
            map.setCenter(mapCenter);
            map.setZoom(12);
          }
        }
        return;
      }

      // 更新选中的活动
      setSelectedDayActivities(activities);
      
      // 更新地图标记和路线
      updateMapMarkers(activities);
    },
    [updateMapMarkers, map, mapCenter]
  );

  // Fetch trip data
  useEffect(() => {
    const fetchTripData = async () => {
      try {
        console.log("Fetching trip data for ID:", tripId);
        const tripDetails = await getTripDetails(tripId);
        
        if (tripDetails) {
          console.log("Found trip:", tripDetails);
          const formattedTrip = {
            id: tripDetails.id,
            tripName: tripDetails.name,
            location: tripDetails.destination,
            dates: [tripDetails.startDate, tripDetails.endDate],
          };
          
          // 设置地图中心点，但不立即缩放
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { address: tripDetails.destination },
            (results, status) => {
              if (status === "OK" && results[0]) {
                const location = results[0].geometry.location;
                formattedTrip.coordinates = {
                  lat: location.lat(),
                  lng: location.lng()
                };
                setMapCenter(formattedTrip.coordinates);
              }
            }
          );
          
          setTripData(formattedTrip);
          
          // 获取行程点
          const tripPoints = await getTripPoints(tripId);
          console.log("Original trip points data:", tripPoints);

          // 格式化 trip points 数据以匹配前端需要的格式
          const formattedActivities = tripPoints.map(point => {
            const longitude = point.location?.coordinates?.[0] || 0;
            const latitude = point.location?.coordinates?.[1] || 0;
            
            return {
              id: point.id,
              title: point.name,
              date: point.date,
              time: point.plannedTime,
              description: point.notes || '',
              duration: point.plannedDuration,
              visitOrder: point.visitOrder,
              location: {
                latitude,
                longitude,
                placeId: '',
                address: '',
                name: point.name
              },
              locationName: point.locationName  // 直接使用后端返回的 locationName
            };
          });

          // 按日期和访问顺序排序
          const sortedActivities = formattedActivities.sort((a, b) => {
            const dateCompare = new Date(a.date) - new Date(b.date);
            if (dateCompare === 0) {
              return a.visitOrder - b.visitOrder;
            }
            return dateCompare;
          });

          setActivities(sortedActivities);
          
          // 找到最近的日期
          if (sortedActivities.length > 0) {
            const dates = [...new Set(sortedActivities.map(a => a.date))];
            const closestDate = findClosestDate(dates);
            const todayActivities = sortedActivities.filter(
              activity => activity.date === closestDate
            );
            
            setSelectedDayActivities(todayActivities);
            
            // 等待地图实例加载完成
            if (map) {
              // 使用 updateMapMarkers 来处理地图更新和路线渲染
              updateMapMarkers(todayActivities);
            } else {
              // 如果地图还没有加载完成，设置一个标记，等地图加载完成后再更新
              const checkMapInterval = setInterval(() => {
                if (map) {
                  updateMapMarkers(todayActivities);
                  clearInterval(checkMapInterval);
                }
              }, 100);

              // 设置一个超时，防止无限等待
              setTimeout(() => clearInterval(checkMapInterval), 5000);
            }
          }
        } else {
          console.log("No trip found");
          message.error("Trip not found");
        }
      } catch (error) {
        console.error("Error fetching trip data:", error);
        message.error("Failed to load trip data");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchTripData();
    }
  }, [tripId, isLoaded, map, updateMapMarkers]);

  const refreshTripPoints = async () => {
    try {
      const tripPoints = await getTripPoints(tripId);
      console.log("Refreshed trip points data:", tripPoints);

      const formattedActivities = tripPoints.map(point => {
        const longitude = point.location?.coordinates?.[0] || 0;
        const latitude = point.location?.coordinates?.[1] || 0;
        
        return {
          id: point.id,
          title: point.name,
          date: point.date,
          time: point.plannedTime,
          description: point.notes || '',
          duration: point.plannedDuration,
          visitOrder: point.visitOrder,
          location: {
            latitude,
            longitude,
            placeId: '',
            address: '',
            name: point.name
          },
          locationName: point.locationName
        };
      });

      // 按日期和访问顺序排序
      const sortedActivities = formattedActivities.sort((a, b) => {
        const dateCompare = new Date(a.date) - new Date(b.date);
        if (dateCompare === 0) {
          return a.visitOrder - b.visitOrder;
        }
        return dateCompare;
      });

      setActivities(sortedActivities);
      
      // Update activities for the selected date
      if (selectedDate) {
        const selectedDayActs = sortedActivities.filter(
          activity => activity.date === selectedDate
        );
        setSelectedDayActivities(selectedDayActs);
        updateMapMarkers(selectedDayActs);
      }
    } catch (error) {
      console.error("Error refreshing trip points:", error);
      message.error("Failed to refresh data");
    }
  };

  const handleAddActivity = async (activityData) => {
    try {
      console.log('Original data for new activity:', activityData);

      // Detailed data validation
      if (!activityData.location) {
        console.error('Missing location data:', activityData);
        throw new Error("Incomplete location data: missing location object");
      }

      if (!activityData.location.latitude || !activityData.location.longitude) {
        console.error('Invalid coordinates:', activityData.location);
        throw new Error("Incomplete location data: invalid coordinates");
      }

      if (!activityData.locationName) {
        console.error('Missing location name:', activityData);
        throw new Error("Incomplete location data: missing location name");
      }

      const tripPointData = {
        title: activityData.title,
        date: activityData.date,
        time: activityData.time,
        description: activityData.description || '',
        duration: parseInt(activityData.duration, 10),
        visitOrder: activityData.visitOrder || 1,
        location: {
          latitude: Number(activityData.location.latitude),
          longitude: Number(activityData.location.longitude),
          placeId: activityData.location.placeId || '',
          address: activityData.location.address || '',
          name: activityData.location.name || activityData.title
        },
        locationName: activityData.locationName
      };

      console.log('Data to be sent to backend:', tripPointData);

      const createdPoint = await createTripPoint(tripId, tripPointData);
      console.log('Response from backend:', createdPoint);
      
      await refreshTripPoints();
      message.success("Activity created successfully");
      return createdPoint;
    } catch (error) {
      console.error("Error creating activity:", error);
      message.error(error.message || "Failed to create activity");
      throw error;
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await deleteTripPoint(activityId);
      await refreshTripPoints();
      message.success("Activity deleted successfully");
    } catch (error) {
      message.error("Failed to delete activity");
    }
  };

  const handleAddOrUpdateActivity = async (values) => {
    try {
      if (isEditMode && editingActivity) {
        // 编辑现有活动
        await handleEditActivity(editingActivity.id, values);
      } else {
        // 创建新活动
        await handleAddActivity(values);
      }

      setIsModalVisible(false);
      setIsEditMode(false);
      setEditingActivity(null);
      form.resetFields();
      setSelectedLocation(null);
    } catch (error) {
      message.error(isEditMode ? "Failed to update activity" : "Failed to create activity");
    }
  };

  const handleEditActivity = async (activityId, values) => {
    try {
      if (!selectedLocation) {
        throw new Error("Please select a location");
      }

      let locationDetails;
      if (selectedLocation.custom) {
        locationDetails = editingActivity.location;
      } else {
        try {
          locationDetails = await handleLocationSelect(
            selectedLocation.value,
            selectedLocation
          );
        } catch (error) {
          console.error('Failed to get location details:', error);
          throw new Error("Failed to get location details");
        }
      }

      const updatedActivity = {
        title: values.title,
        date: selectedDate,
        time: values.time.format("HH:mm"),
        description: values.description || '',
        duration: parseInt(values.duration, 10),
        visitOrder: editingActivity.visitOrder,
        location: locationDetails,
        locationName: selectedLocation.label
      };

      const updated = await updateTripPoint(activityId, updatedActivity);
      await refreshTripPoints();
      message.success("Activity updated successfully");
    } catch (error) {
      console.error("Error updating activity:", error);
      throw error;
    }
  };

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  // 添加计算通勤时间的函数
  const calculateTravelTime = useCallback(async (origin, destination) => {
    if (!window.google || !origin || !destination) return null;

    const directionsService = new window.google.maps.DirectionsService();

    try {
      const result = await new Promise((resolve, reject) => {
        directionsService.route(
          {
            origin: { lat: origin.latitude, lng: origin.longitude },
            destination: { lat: destination.latitude, lng: destination.longitude },
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (response, status) => {
            if (status === "OK") {
              resolve(response);
            } else {
              reject(new Error(`获取路线失败: ${status}`));
            }
          }
        );
      });

      return {
        duration: result.routes[0].legs[0].duration.text,
        distance: result.routes[0].legs[0].distance.text,
      };
    } catch (error) {
      console.error("计算通勤时间时出错:", error);
      return null;
    }
  }, []);

  // 添加 StepDescription 组件
  const StepDescription = React.memo(({ activity, nextActivity, calculateTravelTime }) => {
    const [travelInfo, setTravelInfo] = useState(null);

    useEffect(() => {
      const fetchTravelInfo = async () => {
        if (nextActivity) {
          const info = await calculateTravelTime(
            activity.location,
            nextActivity.location
          );
          setTravelInfo(info);
        }
      };

      fetchTravelInfo();
    }, [activity, nextActivity, calculateTravelTime]);

    return (
      <div>
      
        <div>
          <Typography.Text>
            {dayjs(activity.time, "HH:mm:ss").format("HH:mm")} - {dayjs(activity.time, "HH:mm:ss").add(activity.duration, 'minute').format("HH:mm")}
          </Typography.Text>
        </div>
        {activity.location && (
          <div>
            <EnvironmentOutlined style={{ color: "#52c41a", marginRight: "8px" }} />
            <Typography.Text type="secondary">
              {activity.locationName}
            </Typography.Text>
          </div>
        )}
        {activity.description && (
          <div>
            <InfoCircleOutlined style={{ color: "#faad14", marginRight: "8px" }} />
            <Typography.Text type="secondary">
              {activity.description}
            </Typography.Text>
          </div>
        )}
        {travelInfo && (
          <div style={{ color: "#666", marginTop: "4px" }}>
            <CarOutlined style={{ marginRight: "8px" }} /> To next Activity:
            <br />
            Distance: {travelInfo.distance}
            <br />
            Estimated Time: {travelInfo.duration}
          </div>
        )}
      </div>
    );
  });

  // 修改 getStepDescription 函数
  const getStepDescription = useCallback(({ activity, nextActivity }) => {
    return (
      <StepDescription 
        activity={activity} 
        nextActivity={nextActivity} 
        calculateTravelTime={calculateTravelTime}
      />
    );
  }, [calculateTravelTime]);

  // 添加活动选择处理函数
  const handleActivitySelect = useCallback((activity) => {
    if (activity.location) {
      // 更新地图中心点到选中的活动位置
      const newCenter = {
        lat: activity.location.latitude,
        lng: activity.location.longitude
      };
      setMapCenter(newCenter);
      
      // 如果有地图实例，设置缩放级别
      if (map) {
        map.setZoom(15);  // 设置更近的缩放级别以更好地查看位置
      }
    }
  }, [map]);

  const handleLocationSelect = async (placeId, option) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps Places API not loaded');
      return null;
    }

    const placesService = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

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
              name: result.name,
              description: option.label,
            });
          } else {
            reject(new Error('Failed to get place details'));
          }
        }
      );
    });
  };

  // 添加标记点点击处理函数
  const handleMarkerClick = (activity) => {
    setSelectedMarker(activity);
  };

  // 添加信息窗口关闭处理函数
  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  if (!isLoaded || loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!tripData) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>Trip not found</div>
    );
  }

  return (
    <Content style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Title level={2}>{tripData.tripName}</Title>
      <div style={{ marginBottom: "16px", color: "rgba(0, 0, 0, 0.45)" }}>
        <p>Location: {tripData.location}</p>
        <p>
          Dates: {new Date(tripData.dates[0]).toLocaleDateString()} -{" "}
          {new Date(tripData.dates[1]).toLocaleDateString()}
        </p>
      </div>

      {mapCenter && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={12}
          options={mapOptions}
          onLoad={onLoad}
        >
          {selectedDayActivities.map((activity, index) => {
            // 打印活动的位置数据
            console.log(`活动 ${activity.title} 的位置数据:`, activity.location);
            
            // 确保坐标是有效的数字
            const lat = Number(activity.location.latitude);
            const lng = Number(activity.location.longitude);

            // 如果坐标都是0或者无效，跳过渲染
            if (!lat || !lng || (lat === 0 && lng === 0)) {
              console.warn(`活动 ${activity.title} 的坐标无效，跳过标记点渲染`);
              return null;
            }

            const position = { lat, lng };
            console.log('标记点位置:', position);

            return (
              <MarkerF
                key={activity.id}
                position={position}
                onClick={() => handleMarkerClick(activity)}
                label={{
                  text: `${index + 1}`,
                  color: "white",
                  fontWeight: "bold",
                }}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  fillColor: "#1890ff",
                  fillOpacity: 1,
                  strokeColor: "white",
                  strokeWeight: 2,
                  scale: 14,
                }}
              />
            );
          })}

          {/* 修改路线显示组件 */}
          {directions && (
            <DirectionsRenderer
              onLoad={renderer => {
                if (directionsRendererRef.current) {
                  directionsRendererRef.current.setMap(null);
                }
                directionsRendererRef.current = renderer;
              }}
              onUnmount={() => {
                if (directionsRendererRef.current) {
                  directionsRendererRef.current.setMap(null);
                  directionsRendererRef.current = null;
                }
              }}
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: "#1890ff",
                  strokeOpacity: 0.6,
                  strokeWeight: 4,
                },
              }}
            />
          )}

          {selectedMarker && (
            <InfoWindowF
              position={{
                lat: Number(selectedMarker.location.latitude),
                lng: Number(selectedMarker.location.longitude),
              }}
              onCloseClick={handleInfoWindowClose}
            >
              <div style={{ padding: "5px", maxWidth: "200px" }}>
                <Typography.Title level={5} style={{ margin: "0 0 8px 0" }}>
                  {selectedMarker.title}
                </Typography.Title>
                <p style={{ margin: "4px 0" }}>
                  <ClockCircleOutlined style={{ marginRight: "8px" }} />
                  {selectedMarker.time}
                  {selectedMarker.duration && ` (${selectedMarker.duration}分钟)`}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <EnvironmentOutlined style={{ marginRight: "8px" }} />
                  {selectedMarker.locationName}
                </p>
                {selectedMarker.description && (
                  <p style={{ margin: "4px 0" }}>
                    <InfoCircleOutlined style={{ marginRight: "8px" }} />
                    {selectedMarker.description}
                  </p>
                )}
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      )}

      <div style={{ marginTop: "2rem" }}>
        <Space
          style={{
            marginBottom: "1rem",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Title level={3}>Daily Planner</Title>
        </Space>

        <DailyItinerary
          startDate={tripData.dates[0]}
          endDate={tripData.dates[1]}
          activities={activities}
          onAddActivity={handleAddActivity}
          onDeleteActivity={handleDeleteActivity}
          onUpdateActivity={handleAddOrUpdateActivity}
          onDaySelect={handleDaySelect}
          onActivitySelect={handleActivitySelect}
          getStepDescription={getStepDescription}
          tripData={tripData}
          updateTripPointHelper={updateTripPoint}
        />
      </div>
    </Content>
  );
}
