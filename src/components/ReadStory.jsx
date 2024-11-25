import "../styles/ReadStory.css"; // Import CSS
import lamp from "../assets/lamp.png"; // Import lamp image
import { useState, useEffect } from "react"; // React hooks
import { useParams, Link } from "react-router-dom"; // For route params
import axios from "axios"; // For API calls

const ReadStory = () => {
  const { id } = useParams(); // Get the story ID from the route
  const [story, setStory] = useState(null); // State to store story data
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling
  const [frontCoverImage, setFrontCoverImage] = useState(null); // State for front cover image

  useEffect(() => {
    // Fetch story data
    const fetchStory = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/stories/${id}`);
        setStory(response.data);

        // Dynamically import the front cover image
        const image = await import(`../assets/Story${id}images/front_cover.jpg`);
        setFrontCoverImage(image.default); // Set the imported image
      } catch (error) {
        setError("Failed to fetch story or image.");
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  return (
    <div className="reading-area">
      {/* Lamp and glow */}
      <img src={lamp} alt="Lamp" className="lamp" />
      <div className="round glow"></div>

      {/* Story content */}
      {!loading && !error && story && (
        <div className="book-container">
          {/* Front cover */}
          <div className="book">
            <img
              src={frontCoverImage || "/assets/default_cover.jpg"} // Use dynamically loaded image or fallback
              alt={`${story.title} Front Cover`}
              className="front-cover"
            />
          </div>

          {/* Button to open the book */}
          <Link to={`/readStory/${id}/page/1`} className="open-book-btn">
            <span className="arrow">➜</span> {/* Arrow icon */}
          </Link>
        </div>
      )}

      {/* Loading and error messages */}
      {loading && <p>Loading story...</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ReadStory;
