// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// API configuration
const apiConfig = {
  baseUrl: process.env.REACT_APP_API_URL,
  mapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  mapsId: process.env.REACT_APP_GOOGLE_MAPS_ID
};

export { firebaseConfig, apiConfig }; 