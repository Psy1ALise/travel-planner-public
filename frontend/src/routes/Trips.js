import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  Button,
  Space,
  Input,
  Typography,
  Row,
  Col,
  message,
  Modal
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { getUserTrips, deleteTrip, getTripByTripId } from "../utils";

const { Title } = Typography;

export default function Trips({ searchFilter }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [trips, setTrips] = useState([]);
  const [placePhotos, setPlacePhotos] = useState({});
  const [localSearchFilter, setLocalSearchFilter] = useState("");
  const [_, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, [location]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const tripsData = await getUserTrips();
      setTrips(tripsData);
      
      // Fetch photos for each trip location
      tripsData.forEach((trip) => {
        fetchPlacePhoto(trip.destination, trip.id);  // Note: changed location to destination to match backend
      });
    } catch (error) {
      message.error('Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlacePhoto = async (location, tripId) => {
    try {
      // First get place ID
      const placesService = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );

      placesService.findPlaceFromQuery(
        {
          query: location,
          fields: ["place_id"],
        },
        (results, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            results &&
            results[0]
          ) {
            // Get place details with photos
            placesService.getDetails(
              {
                placeId: results[0].place_id,
                fields: ["photos"],
              },
              (place, detailStatus) => {
                if (
                  detailStatus ===
                    window.google.maps.places.PlacesServiceStatus.OK &&
                  place?.photos?.length > 0
                ) {
                  const photoUrl = place.photos[0].getUrl({
                    maxWidth: 400,
                    maxHeight: 200,
                  });
                  setPlacePhotos((prev) => ({
                    ...prev,
                    [tripId]: photoUrl,
                  }));
                }
              }
            );
          }
        }
      );
    } catch (error) {
      console.error("Error fetching place photo:", error);
    }
  };

  const handleCreateTrip = () => {
    console.log("Navigating to create trip"); // Debug log
    navigate("/trips/create", { replace: false });
  };

  const handlePlanTrip = async (tripId) => {
    try {
      const tripDetails = await getTripByTripId(tripId);
      console.log("Trip details:", tripDetails);
      navigate(`/trips/${tripId}/plan`, { state: { tripDetails } });
    } catch (error) {
      message.error('Failed to fetch trip details');
    }
  };

  const handleDelete = async (tripId) => {
    Modal.confirm({
      title: 'Delete Trip',
      content: 'Are you sure you want to delete this trip?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      async onOk() {
        try {
          await deleteTrip(tripId);
          await fetchTrips(); // 删除后重新获取数据
          message.success("Trip deleted successfully");
        } catch (error) {
          message.error("Failed to delete trip");
        }
      },
    });
  };

  const handleSearch = (value) => {
    setLocalSearchFilter(value);
  };

  const filteredTrips = trips.filter((trip) => {
    const searchTerm = (searchFilter || localSearchFilter).toLowerCase();
    if (!searchTerm) return true;
    return (
      trip.name.toLowerCase().includes(searchTerm) ||
      trip.destination.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Title level={2}>My Trips</Title>
        <Space>
          <Input
            placeholder="Search trips..."
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            onChange={(e) => handleSearch(e.target.value)}
            value={localSearchFilter || searchFilter}
          />
          <Button type="primary" onClick={handleCreateTrip}>
            Create New Trip
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {filteredTrips.map((trip) => (
          <Col xs={24} sm={12} md={8} lg={6} key={trip.id}>
            <Card
              hoverable
              cover={
                <div
                  style={{
                    height: 200,
                    background: "#f0f2f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    alt={trip.destination}
                    src={
                      placePhotos[trip.id] ||
                      `https://source.unsplash.com/400x200/?${trip.destination}`
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              }
              actions={[
                <Button
                  type="primary"
                  onClick={() => handlePlanTrip(trip.id)}
                  style={{ margin: "0 8px" }}
                >
                  Plan Trip
                </Button>,
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(trip.id)}
                />,
              ]}
            >
              <Card.Meta
                title={trip.name}
                description={
                  <Space direction="vertical">
                    <div>
                      <EnvironmentOutlined style={{ marginRight: "8px" }} />
                      {trip.destination}
                    </div>
                    <div>
                      <CalendarOutlined style={{ marginRight: "8px" }} />
                      {new Date(trip.startDate).toLocaleDateString()} -{" "}
                      {new Date(trip.endDate).toLocaleDateString()}
                    </div>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
