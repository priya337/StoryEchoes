import "../styles/WonderShelf.css"; // Importing styles
import Add from "../assets/plus.png"; // Importing Add Story icon
import { useState, useEffect } from "react"; // Importing React hooks
import { Link } from "react-router-dom";

import Spinner from "react-bootstrap/Spinner";

import { useStories } from "../contexts/stories.context.jsx";
import FunctionBar from "./FunctionBar";
import ActionBar from "./ActionBar";

const WonderShelf = () => {
  const { stories, loading, error } = useStories(); //Fetched stories in Context API
  const [searchStr, setSearchStr] = useState(""); // State for search text
  const [filteredBooks, setFilteredBooks] = useState([...stories]);
  const [hasResults, setHasResults] = useState(0);
  const [ascSort, setAscSort] = useState(true);
  const [gridMode, setGridMode] = useState(true);

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
      const titleA = a.title || ""; // Fallback to empty string
      const titleB = b.title || ""; // Fallback to empty string

      if (ascSort) {
        return titleA.localeCompare(titleB);
      } else {
        return titleB.localeCompare(titleA);
      }
    });
  }

  useEffect(() => {
    let tempBooks = stories.filter((story) => story.title); // Exclude invalid entries

    if (searchStr) {
      tempBooks = tempBooks.filter((oneStory) =>
        oneStory.title.toUpperCase().includes(searchStr.toUpperCase())
      );
    }

    tempBooks = sortByTitle(tempBooks);
    setFilteredBooks([...tempBooks]);
    setHasResults(tempBooks.length);
  }, [searchStr, stories, ascSort]);

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
                  <h3>Echoed by {story.Author ? story.Author : "Anonymous"}</h3>
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
