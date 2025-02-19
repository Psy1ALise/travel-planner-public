# Travel Planner

A full-stack application that helps users plan their trips with an interactive timeline and map-based interface.

![Project Screenshot](docs/screenshots/main.png)

## ✨ Features

### Core Features
- 📝 User authentication and profile management
- 🗺️ Google Maps integration for location search and route planning
- 📅 Interactive timeline for trip planning
- 📸 Point of interest image upload and storage
- 📱 Responsive design for mobile access

### User Experience
- ⚡ Real-time route planning and time estimation
- 🎨 Intuitive drag-and-drop interface
- 🌈 Clean and modern UI design
- 🔄 Seamless data synchronization

## 🛠️ Tech Stack

### Backend
- ☕ Java 17
- 🍃 Spring Boot 3.4
- 🔒 Spring Security + JWT
- 📊 PostgreSQL + PostGIS
- ☁️ Google Cloud Storage
- 🐘 Gradle

### Frontend
- ⚛️ React 18
- 🎨 Ant Design
- 🗺️ Google Maps API
- 🔥 Firebase Hosting

## 🚀 Getting Started

### Frontend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/travel-planner.git
cd travel-planner/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the .env file with your configuration:
```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_GOOGLE_MAPS_ID=your_google_maps_id
```

4. Start the development server:
```bash
npm start
```

### Backend Setup

1. Set up PostgreSQL database:
```bash
# Install PostgreSQL and PostGIS
sudo apt-get install postgresql postgresql-contrib postgis
```

2. Configure environment variables:
```bash
cd ../backend
cp .env.example .env
```
Edit the .env file with your database and other configurations.

3. Set up Google Cloud credentials:
- Create a service account in Google Cloud Console
- Download the credentials file as credentials.json
- Place it in the backend/src/main/resources/ directory

4. Run the application:
```bash
./gradlew bootRun
```

## 📦 Deployment

### Frontend Deployment (Firebase)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize project:
```bash
firebase init hosting
```

4. Build and deploy:
```bash
npm run build
firebase deploy
```

### Backend Deployment (Google Cloud Run)

1. Build Docker image:
```bash
docker build -t gcr.io/[PROJECT_ID]/travel-planner-backend .
```

2. Push image:
```bash
docker push gcr.io/[PROJECT_ID]/travel-planner-backend
```

3. Deploy to Cloud Run:
```bash
gcloud run deploy travel-planner-backend \
  --image gcr.io/[PROJECT_ID]/travel-planner-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_NAME=travelplanner,CLOUD_SQL_CONNECTION_NAME=[CONNECTION_NAME]"
```

## 📝 API Documentation

API documentation is generated using Swagger UI and can be accessed at:
- Local: http://localhost:8080/swagger-ui.html
- Production: https://your-api-url/swagger-ui.html

## 🤝 Contributing

We welcome all contributions! Here's how you can help:
- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🔨 Submit pull requests

### Contribution Steps

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 Environment Variables

### Frontend Variables
```
REACT_APP_API_URL=Backend API URL
REACT_APP_GOOGLE_MAPS_API_KEY=Google Maps API Key
REACT_APP_GOOGLE_MAPS_ID=Google Maps ID
```

### Backend Variables
```
DATABASE_NAME=Database name
CLOUD_SQL_CONNECTION_NAME=Cloud SQL connection name
DATABASE_USERNAME=Database username
DATABASE_PASSWORD=Database password
JWT_SECRET_KEY=JWT secret key
GCS_BUCKET=Google Cloud Storage bucket name
```

## ⚠️ Important Notes

1. Security
   - Never commit sensitive keys
   - Use environment variables for sensitive data
   - Use key management services in production
   - Set appropriate API key restrictions

2. Performance
   - Image upload limit: 10MB
   - Database indexes implemented
   - Request caching enabled

## 🔮 Roadmap

- [ ] Social sharing features
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Weather service integration
- [ ] Budget management
- [ ] PDF export functionality

## 📫 Contact

- Maintainer: [Your Name](mailto:your.email@example.com)
- Project Link: [GitHub](https://github.com/yourusername/travel-planner)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Maps Platform
- Spring Boot
- React
- Ant Design
- All contributors 