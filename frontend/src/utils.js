import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080"; // 使用环境变量
const API_URL = `${BASE_URL}/api`; 

// Auth header helper
const getAuthHeader = () => ({
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// Trip APIs
export const createTrip = async (tripData) => {
  try {
    const response = await axios.post(`${API_URL}/trips`, {
      userId: Number(localStorage.getItem('userId')),
      name: tripData.tripName,
      startDate: tripData.dates[0],
      endDate: tripData.dates[1],
      total_Budget: Number(tripData.budget),
      destination: tripData.location
    }, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Failed to create trip';
  }
};

export const getUserTrips = async () => {
  const userId = localStorage.getItem('userId');
  const response = await axios.get(`${API_URL}/trips?userId=${userId}`, getAuthHeader());
  return response.data;
};

export const getTripByTripId = async (tripId) => {
  try {
    const response = await axios.get(`${API_URL}/trips/${tripId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching trip details:', error);
    throw error;
  }
};

export const deleteTrip = async (tripId) => {
  const userId = localStorage.getItem('userId');
  await axios.delete(`${API_URL}/trips/${tripId}?userId=${userId}`, getAuthHeader());
};

// POI (Points of Interest) APIs
export const addPOI = async (tripId, poiData) => {
  try {
    const response = await axios.post(
      `${API_URL}/trips/${tripId}/pois`,
      poiData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to add POI");
  }
};

export const getPOIs = async (tripId) => {
  try {
    const response = await axios.get(`${API_URL}/trips/${tripId}/pois`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch POIs");
  }
};

export const deletePOI = async (tripId, poiId) => {
  try {
    await axios.delete(`${API_URL}/trips/${tripId}/pois/${poiId}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete POI");
  }
};

// Activity APIs
export const addActivity = async (tripId, activityData) => {
  try {
    const response = await axios.post(
      `${API_URL}/trips/${tripId}/activities`,
      activityData
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to add activity");
  }
};

export const getActivities = async (tripId) => {
  try {
    const response = await axios.get(`${API_URL}/trips/${tripId}/activities`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch activities"
    );
  }
};

export const updateActivity = async (tripId, activityId, activityData) => {
  try {
    const response = await axios.put(
      `${API_URL}/trips/${tripId}/activities/${activityId}`,
      activityData
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update activity"
    );
  }
};

export const deleteActivity = async (tripId, activityId) => {
  try {
    await axios.delete(`${API_URL}/trips/${tripId}/activities/${activityId}`);
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete activity"
    );
  }
};

// TripPoint APIs
export const createTripPoint = async (tripId, tripPointData) => {
  try {
    console.log('Original data for new trip point:', tripPointData);

    const requestBody = {
      trip: Number(tripId),
      name: tripPointData.title,
      date: tripPointData.date,
      visitOrder: tripPointData.visitOrder || 1,
      pointType: "VISIT",
      plannedDuration: Number(tripPointData.duration) || 60,
      plannedTime: tripPointData.time,
      location: {
        x: Number(tripPointData.location.longitude),
        y: Number(tripPointData.location.latitude)
      },
      locationName: tripPointData.locationName,
      notes: tripPointData.description || ''
    };

    console.log('Data to be sent to backend:', requestBody);

    const response = await axios.post(
      `${API_URL}/trip-points`, 
      requestBody,
      getAuthHeader()
    );
    
    console.log('Response from backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating trip point:', error);
    throw new Error(error.response?.data?.message || "Failed to create trip point");
  }
};

export const getTripPoints = async (tripId, date) => {
  try {
    let url = `${API_URL}/trip-points?`;
    if (tripId) url += `tripId=${tripId}&`;
    if (date) url += `date=${date}`;
    
    const response = await axios.get(url, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch trip points");
  }
};

export const updateTripPoint = async (id, tripPointData) => {
  try {
    console.log('Original data for updating trip point:', tripPointData);

    const requestBody = {
      name: tripPointData.title,
      date: tripPointData.date,
      visitOrder: tripPointData.visitOrder,
      pointType: 'VISIT',
      plannedDuration: Number(tripPointData.duration) || 60,
      plannedTime: tripPointData.time,
      location: {
        x: Number(tripPointData.location.longitude),
        y: Number(tripPointData.location.latitude)
      },
      locationName: tripPointData.locationName,
      notes: tripPointData.description || ''
    };

    console.log('Data to be sent to backend:', requestBody);

    const response = await axios.put(
      `${API_URL}/trip-points/${id}`, 
      requestBody,
      getAuthHeader()
    );

    console.log('Response from backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating trip point:', error);
    throw new Error(error.response?.data?.message || "Failed to update trip point");
  }
};

export const deleteTripPoint = async (id) => {
  try {
    await axios.delete(`${API_URL}/trip-points/${id}`, getAuthHeader());
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete trip point");
  }
};

// Authentication APIs
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    
    // Store token
    const token = response.data.token;
    localStorage.setItem("token", token);
    
    // Fetch and store user data
    const userData = await getCurrentUser();
    localStorage.setItem("username", userData.username);
    localStorage.setItem("email", userData.email);
    localStorage.setItem("image_url",userData.imageUrl);
    localStorage.setItem("userId", userData.id)
    
    return {
      token,
      user: userData
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch user data");
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      username: userData.username,
      email: userData.email,
      password: userData.password
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
};

export const getTripDetails = async (tripId) => {
  try {
    const response = await axios.get(`${API_URL}/trips/${tripId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || "Failed to fetch trip details");
  }
};

export const updateAvatar = async (file, username) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('username', username);

  try {
    const { data } = await axios.put(`${BASE_URL}/auth/updateAvatar`, formData, {
      ...getAuthHeader(),
      headers: {
        ...getAuthHeader().headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateInfo = async(values) => {
  try {
    const response = await axios.put(`${BASE_URL}/auth/updateInfo`, {
      id: localStorage.getItem("userId"),
      username: values.username,
      email: values.email,
      password: values.password
    }, getAuthHeader());

    const Data = response.data;
    localStorage.setItem("username", Data.username);
    localStorage.setItem("email", Data.email);
    localStorage.setItem("image_url",Data.imageUrl);
    localStorage.setItem("token", Data.token);

    return Data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "update information failed");
  }
};

export const changePassword = async(values) => {
  try {
    const response = await axios.put(`${BASE_URL}/auth/updatePassword`, {
      id: localStorage.getItem("userId"),
      oldPassword: values.oldPassword,
      newPassword: values.newPassword
    }, getAuthHeader());
    console.log("change user password", response.data);
  } catch (error) {
    throw new Error(error.response?.data?.message || "change password failed");
  }
};

// Add axios interceptor for authentication
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
