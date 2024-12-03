import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../api";
import { useStories } from "../contexts/stories.context.jsx";

import VerticallyCenteredModal from "./VerticallyCenteredModal";

const EditDeleteButton = ({ story }) => {
  const [showDelConf, setShowDelConf] = useState(false);

  const { setRefresh } = useStories(); //Fetched stories in Context API

  function onDelete() {
    //Call Delete API to delete the story
    api
      .delete(`/stories/${story.id}`)
      .then(() => {
        //Indicate Context API for refresh
        setRefresh((prev) => prev + 1);
      })
      .catch((error) => console.log("Error during story delete:", error));
  }

  return (
    <div className="edit-del-buttons">
      {/*Edit Button*/}
      <Link to={`/editStory/${story.id}`}>
        <button
          className={
            story.staticBook
              ? "edit-disabled-button action-button"
              : "edit-button action-button"
          }
        ></button>
      </Link>

      {/*Delete Button*/}
      <div
        className={
          story.staticBook
            ? "delete-disabled-button action-button"
            : "delete-button action-button"
        }
        onClick={() =>
          story.staticBook ? setShowDelConf(false) : setShowDelConf(true)
        }
      ></div>

      {/*Show Delete confirmation*/}
      <VerticallyCenteredModal
        size={"sm"}
        header={"Confirm Delete"}
        message={"Are you sure you want to delete this Story?"}
        onDelete={onDelete}
        show={showDelConf}
        setShow={setShowDelConf}
      />
    </div>
  );
};

export default EditDeleteButton;
