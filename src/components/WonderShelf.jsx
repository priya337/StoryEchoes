import "../styles/WonderShelf.css"; // Importing styles
import Add from "../assets/plus.png"; // Importing Add Story icon
import { useState, useEffect } from "react"; // Importing React hooks
import { Link } from "react-router-dom";

import Spinner from "react-bootstrap/Spinner";
import axios from "axios";

import FunctionBar from "./FunctionBar";
import ActionBar from "./ActionBar";

const WonderShelf = () => {
  const [stories, setStories] = useState([]); // State to store stories
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling
  const [searchStr, setSearchStr] = useState(""); // State for search text
  const [filteredBooks, setFilteredBooks] = useState([...stories]);
  const [hasResults, setHasResults] = useState(0);
  const [ascSort, setAscSort] = useState(true);
  const [gridMode, setGridMode] = useState(true);

  // Fetch stories from the backend API when the component loads
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/stories"); // Replace with your backend URL
        setStories(data); // Save fetched stories in the state
      } catch (error) {
        setError("Failed to fetch stories. Please try again later."); // Handle error
      } finally {
        setLoading(false); // Stop loading indicator
      }
    };

    fetchStories(); // Call the fetch function
  }, []); // Runs once when the component mounts

  useEffect(() => {
    /*Search filter added here*/
    let tempBooks = [...stories];
    if (searchStr) {
      tempBooks = stories.filter((oneStory) => {
        return (
          oneStory.title.toUpperCase().search(searchStr.toUpperCase()) >= 0
        );
      });
    }
    tempBooks = sortByTitle(tempBooks);
    setFilteredBooks([...tempBooks]);
    setHasResults(tempBooks.length);
  }, [searchStr, stories, ascSort]);

  function sortByTitle(books) {
    return books.sort((a, b) => {
      if (ascSort) {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
  }

  /* Display loading indicator */
  if (loading) {
    return (
      <div className="message-area">
        <Spinner animation="grow" variant="info" />
        <p>Unveiling imaginative tales...</p>
      </div>
    );
  }

  /* Display error */
  if (error) {
    return (
      <div className="message-area">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="wonder-shelf">
      {/* Search & Sort */}
      <div className="function-area">
        <FunctionBar
          searchStr={searchStr}
          setSearchStr={setSearchStr}
          ascSort={ascSort}
          setAscSort={setAscSort}
          gridMode={gridMode}
          setGridMode={setGridMode}
        />
      </div>

      {/* Display stories in Grid Mode*/}
      {gridMode && (
        <div className="story-list">
          {/* + Symbol for Adding a New Story */}
          <div>
            <Link to="/addStory">
              <div>
                <img src={Add} alt="Add Story Logo" className="add-icon"></img>
              </div>
            </Link>
          </div>

          {/* Display book cards with cover, title & author */}
          {filteredBooks.map((story) => (
            <div key={story.id} className="story-item">
              <Link to={`/readStory/${story.id}`}>
                <div className="story-card">
                  <img src={story.front_cover} alt={`${story.title} Tile`} />
                  <h2>{story.title}</h2>
                  <h3>Echoed by{story.author}</h3>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Display stories in Grid Mode*/}
      {!gridMode && (
        <div className="story-list-view">
          {filteredBooks.map((story) => (
            <Link to={`/readStory/${story.id}`}>
              <ActionBar story={story}></ActionBar>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default WonderShelf;
