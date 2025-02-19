import { useState, useEffect } from "react";
import {
  Form,
  Input,
  DatePicker,
  Button,
  Modal,
  message,
  AutoComplete,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useLoadScript } from "@react-google-maps/api";
import { createTrip } from "../utils"

const libraries = ["places"];

export default function CreateTrip() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [autocompleteService, setAutocompleteService] = useState(null);
  const [placesService, setPlacesService] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    if (isLoaded && window.google) {
      setAutocompleteService(
        new window.google.maps.places.AutocompleteService()
      );
      setPlacesService(
        new window.google.maps.places.PlacesService(
          document.createElement("div")
        )
      );
    }
  }, [isLoaded]);

  useEffect(() => {
    form.resetFields();
    setIsModalVisible(true);
    return () => {
      setIsModalVisible(false);
    };
  }, [form, location]);

  const handleLocationSearch = async (value) => {
    setSearchText(value);
    if (!value || !autocompleteService) {
      setLocationSuggestions([]);
      return;
    }

    const request = {
      input: value,
      types: [
        "locality",
        "sublocality",
        "administrative_area_level_1",
        "administrative_area_level_2",
        "country",
      ],
    };

    try {
      autocompleteService.getPlacePredictions(
        request,
        (predictions, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            console.log("Predictions:", predictions);
            const suggestions = predictions.map((prediction) => ({
              value: prediction.place_id,
              label: prediction.description,
            }));
            setLocationSuggestions(suggestions);
          } else {
            console.log("No predictions or error:", status);
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
    console.log("Selected:", placeId, option);
    if (!placesService) return;

    setSearchText(option.label);

    placesService.getDetails(
      {
        placeId: placeId,
        fields: ["geometry", "formatted_address", "name"],
      },
      (result, status) => {
        console.log("Place details:", result);
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const locationData = {
            description: option.label,
            placeId: placeId,
            coordinates: {
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng(),
            },
          };
          setSelectedLocation(locationData);
          form.setFieldsValue({
            location: option.label,
            coordinates: locationData.coordinates,
          });
        }
      }
    );
  };

  const handleSubmit = async (values) => {
    if (!selectedLocation) {
      message.error("Please select a valid location from the suggestions");
      return;
    }
  
    try {
      const tripData = {
        tripName: values.tripName,
        location: selectedLocation.description,
        dates: [
          values.dates[0].format('YYYY-MM-DD'),
          values.dates[1].format('YYYY-MM-DD')
        ],
        budget: values.budget
      };
  
      createTrip(tripData);
      
      message.success("Trip created successfully!");
      setIsModalVisible(false);
      // TODO
      navigate("/trips");
      // navigate(`/trips/${response.id}/plan`);
    } catch (error) {
      // Handle error as a string
      const errorMessage = typeof error === 'string' ? error : 'Failed to create trip';
      message.error(errorMessage);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    navigate("/trips");
  };

  const handleLocationChange = (value) => {
    setSearchText(value);
    if (selectedLocation && value !== selectedLocation.description) {
      setSelectedLocation(null);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <Modal
      title="Create New Trip"
      open={isModalVisible}
      onCancel={handleCancel}
      footer={null}
      maskClosable={false}
      keyboard={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          name="tripName"
          label="Trip Name"
          rules={[{ required: true, message: "Please enter the trip name" }]}
        >
          <Input placeholder="Enter trip name" />
        </Form.Item>

        <Form.Item
          name="location"
          label="Destination"
          rules={[
            { required: true, message: "Please select a destination" },
            {
              validator: (_, value) => {
                if (!selectedLocation) {
                  return Promise.reject(
                    "Please select a location from the suggestions"
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <AutoComplete
            options={locationSuggestions}
            onSearch={handleLocationSearch}
            onSelect={(value, option) => handleLocationSelect(value, option)}
            placeholder="Search for a city, state, or country"
            style={{ width: "100%" }}
            value={searchText}
            onChange={handleLocationChange}
          />
        </Form.Item>

        <Form.Item name="coordinates" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name="dates"
          label="Trip Dates"
          rules={[{ required: true, message: "Please select the dates" }]}
        >
          <DatePicker.RangePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="budget"
          label="Budget"
          rules={[
            { required: true, message: "Please enter your budget" },
            {
              validator: (_, value) => {
                if (value && value <= 0) {
                  return Promise.reject('Budget must be a positive number');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input
            type="number"
            prefix="$"
            placeholder="Enter your budget"
            style={{ width: "100%" }}
            min="0"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Create Trip
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
