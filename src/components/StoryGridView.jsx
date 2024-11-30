import AddLogo from "../assets/plus.png"; // Importing Add Story icon
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { useStories } from "../contexts/stories.context.jsx";
import api from "../api";

import LikeButton from "./LikeButton";
import ReadCount from "./ReadCount";
import EditDeleteButton from "./EditDeleteButton";

const StoryGridView = ({ filteredBooks, mode }) => {
  const { stories, setStories } = useStories(); //Fetched stories in Context API

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
    let tempStories = stories.map((oneStory) => {
      if (oneStory.id === story.id) {
        oneStory.liked = story.liked;
      }
      return oneStory;
    });

    //Call Update function & update the story like
    api
      .put(`/stories/${story.id}`, story)
      .then(() => {
        setStories([...tempStories]); //Update the Context Data
      })
      .catch((error) =>
        console.log("Error during story update Story Like:", error)
      );
  }

  return (
    <>
      {mode === "View" && <h2 className="fav-title">Story Treasures</h2>}
      <div className="story-list">
        {/* + Symbol for Adding a New Story */}
        {mode === "Edit" && (
          <div>
            <Link to="/addStory">
              <div>
                <img
                  src={AddLogo}
                  alt="Add Story Logo"
                  className="add-icon"
                ></img>
              </div>
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
