import video from "../images/travel3.mp4";
import logo from "../images/logo2.png";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="video-background">
        <video autoPlay loop muted playsInline className="background-video">
          <source src={video} type="video/mp4" />
        </video>
      </div>
      <div className="logo-container">
        <img src={logo} alt="The Next Horizon Logo" className="home-logo" />
      </div>
      <div className="hero">
        <h1 className="main-title">Welcome to Travel Planner</h1>
        <p className="tagline">Chase every sunrise, discover every sunset.</p>

        <div className="description-container">
          <p className="description">
            Travel Planner is your ultimate travel companion—helping you design,
            organize, and navigate your perfect journey. From planning
            personalized itineraries to marking your must-visit spots, we make
            sure your trips are seamless, memorable, and stress-free.
          </p>

          <div className="features">
            <p>Create & Manage Trips – Organize every detail in one place.</p>
            <p>
              Interactive Maps & Point of Interests – Pin your destinations and
              customize your route.
            </p>
            <p>Itinerary Planner – Structure your days with ease.</p>
          </div>

          <p className="cta-text">Adventure awaits—start your journey now!</p>
        </div>

        <button className="cta-button" onClick={() => navigate("/login")}>
          Log in
        </button>
      </div>
    </div>
  );
}
