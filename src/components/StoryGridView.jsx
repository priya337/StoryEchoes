import AddLogo from "../assets/plus.png"; // Importing Add Story icon
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { useUsers } from "../contexts/user.context.jsx";
import api from "../api";

import LikeButton from "./LikeButton";
import ReadCount from "./ReadCount";
import EditDeleteButton from "./EditDeleteButton";
import NoFavs from "./NoFavs";

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const StoryGridView = ({ filteredBooks, mode }) => {
  const { user, userDetails, setUserDetails } = useUsers(); //Fetched stories in Context API

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

  function handleLike(e, story) {
    e.preventDefault(); //On Click of Like Button the Story should not open for read

    if (!user) return;

    if (userDetails.bookIds.includes(story.id)) {
      // Disliked the book
      userDetails.bookIds = userDetails.bookIds.filter((id) => id !== story.id);
    } else {
      // Liked the book
      userDetails.bookIds.push(story.id);
    }

    //Call Update function & update the story like
    api
      .put(`/users/${userDetails.id}`, userDetails)
      .then(({ data }) => {
        setUserDetails(data);
      })
      .catch((error) =>
        console.log("Error during story update Story Like:", error)
      );
  }

  return (
    <>
      {mode === "View" && <h2 className="fav-title">Story Treasures</h2>}
      <div className="story-list">
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

        {/* Display book cards with cover, title & author */}
        {listBooks.map((story) => (
          <div key={story.id} className="story-item">
            <Link to={`/readStory/${story.id}`}>
              <div className="story-card">
                <img src={story.front_cover} alt={`${story.title} Tile`} />
                <h2>{story.title}</h2>
                <h3>Echoed by {story.Author ? story.Author : "Anonymous"}</h3>
              </div>
            </Link>

            <div className="story-card-action">
              {/*Like Button*/}
              <LikeButton
                story={story}
                handleLike={(e) => handleLike(e, story)}
              />

              {/*View Count*/}
              {mode && mode === "View" && <ReadCount story={story}></ReadCount>}

              {/*Delete Button*/}
              {mode && mode === "Edit" && (
                <EditDeleteButton story={story}></EditDeleteButton>
              )}
            </div>
          </div>
        ))}
      </div>{" "}
    </>
  );
};

export default StoryGridView;
