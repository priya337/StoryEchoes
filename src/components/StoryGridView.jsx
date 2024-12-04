import AddLogo from "../assets/plus.png"; // Importing Add Story icon
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { useStories } from "../contexts/stories.context.jsx";
import api from "../api";

import LikeButton from "./LikeButton";
import ReadCount from "./ReadCount";
import EditDeleteButton from "./EditDeleteButton";
import EmptyBookShelfPic from "../assets/empty-bookshelf.png";

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const StoryGridView = ({ filteredBooks, mode }) => {
  const { setRefresh } = useStories(); //Fetched stories in Context API

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
    story.liked = story.liked ? false : true;

    //Call Update function & update the story like
    api
      .put(`/stories/${story.id}`, story)
      .then(() => {
        //Indicate Context API for refresh
        setRefresh((prev) => prev + 1);
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
        {mode === "View" && listBooks.length <= 0 && (
          <div>
            <h4 className="empty-fav-msg">
              Your bookshelf is looking a little lonely! <br />
              ❤️ Mark your favorite stories to bring it to life!
            </h4>
            <img
              src={EmptyBookShelfPic}
              alt=""
              className="empty-book-shelf-img"
            />
          </div>
        )}

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
