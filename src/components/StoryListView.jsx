import AddLogo from "../assets/plus.png"; // Importing Add Story icon
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ActionBar from "./ActionBar";

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import NoFavs from "./NoFavs";

const StoryListView = ({ filteredBooks, mode }) => {
  const [listBooks, setListBooks] = useState([]);

  useEffect(() => {
    if (mode === "View") {
      let tempBooks = filteredBooks.filter((oneStory) => {
        return oneStory.liked;
      });
      setListBooks([...tempBooks]);
    } else {
      setListBooks([...filteredBooks]);
    }
  }, [filteredBooks, mode]);

  return (
    <>
      {mode === "View" && <h2 className="fav-title">Story Treasures</h2>}
      <div className="story-list-view">
        {/*No Favourites*/}
        {mode === "View" && listBooks.length <= 0 && <NoFavs></NoFavs>}

        {/* + Symbol for Adding a New Story */}
        {mode === "Edit" && (
          <div>
            <Link to="/addStory">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="like-tooltip">Add a Story</Tooltip>}
              >
                <button className="add-button">
                  <img src={AddLogo} alt="Add Icon" />
                </button>
              </OverlayTrigger>
            </Link>
          </div>
        )}

        {listBooks.map((story) => (
          <Link to={`/readStory/${story.id}`} key={story.id}>
            <ActionBar story={story} mode={mode}></ActionBar>
          </Link>
        ))}
      </div>
    </>
  );
};

export default StoryListView;
