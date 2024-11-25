import "../styles/WonderShelf.css"; // Importing styles
import Add from "../assets/plus.png"; // Importing Add Story icon
import { useState, useEffect } from "react"; // Importing React hooks
import axios from "axios"; // Importing Axios for API calls
import { Link } from "react-router-dom"; // Importing Link for navigation

const WonderShelf = () => {
  const [stories, setStories] = useState([]); // State to store stories
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling

  // Fetch stories from the backend API when the component loads
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await axios.get("http://localhost:400/stories"); // Replace with your backend URL
        setStories(response.data); // Save fetched stories in the state
      } catch (error) {
        setError("Failed to fetch stories. Please try again later."); // Handle error
      } finally {
        setLoading(false); // Stop loading indicator
      }
    };

    fetchStories(); // Call the fetch function
  }, []); // Runs once when the component mounts

  return (
    <div className="wonder-shelf">
      {/* Display stories */}
      <div className="story-list">
        {/* + Symbol for Adding a New Story */}
        <div className="story-item">
          <Link to="/addStory">
            <img src={Add} alt="Add Story Logo" className="story-cover add-icon"></img>
          </Link>
        </div>

        {/* Display loading indicator */}
        {loading && <p>Loading stories...</p>}

        {/* Display error message */}
        {error && <p className="error-message">{error}</p>}

        {/* Display book tiles with 'imageforstorytile.jpg' */}
        {stories.map((story) => (
          <div key={story.id} className="story-item">
            <Link to={`/readStory/${story.id}`}>
              <img
                src={story.imageforstorytile} // Use `imageforstorytile.jpg` for the story tile
                alt={`${story.title} Tile`}
                className="story-cover"
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WonderShelf;
