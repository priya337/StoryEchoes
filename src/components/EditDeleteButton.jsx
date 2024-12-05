import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api";
import { useStories } from "../contexts/stories.context.jsx";

import VerticallyCenteredModal from "./VerticallyCenteredModal";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

import EditIcon from "../assets/edit.png";
import EditDisabledIcon from "../assets/edit-disabled.png";
import DelIcon from "../assets/delete.png";
import DelDisabledIcon from "../assets/delete-disabled.png";

const EditDeleteButton = ({ story }) => {
  const [showDelConf, setShowDelConf] = useState(false);
  const navigate = useNavigate();

  const { setRefresh } = useStories(); //Fetched stories in Context API

  function checkEdit(e) {
    e.preventDefault();

    if (story.staticBook) {
      return;
    }

    //Navigate to the edit page for the story
    navigate(`/editStory/${story.id}`);
  }

  function checkDelete(e) {
    e.preventDefault();

    if (story.staticBook) {
      return;
    }

    setShowDelConf(true);
  }

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
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id="edit-tooltip">
            {story.staticBook
              ? "Static Book: Editing Disabled"
              : "Edit the Story"}
          </Tooltip>
        }
      >
        <button className="action-button" onClick={checkEdit}>
          <img
            src={story.staticBook ? EditDisabledIcon : EditIcon}
            alt="Edit Icon"
          />
        </button>
      </OverlayTrigger>

      {/*Delete Button*/}
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id="delete-tooltip">
            {story.staticBook
              ? "Static Book: Delete Disabled"
              : "Delete the Story"}
          </Tooltip>
        }
      >
        <button className="action-button" onClick={checkDelete}>
          <img
            src={story.staticBook ? DelDisabledIcon : DelIcon}
            alt="Delete Icon"
          />
        </button>
      </OverlayTrigger>

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
