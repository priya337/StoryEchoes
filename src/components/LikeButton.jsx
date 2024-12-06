import LikeIcon from "../assets/like.png";
import LikedIcon from "../assets/liked.png";

import { useState } from "react";
import { useUsers } from "../contexts/user.context.jsx";
import SignInModal from "./SignInModal.jsx";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const LikeButton = ({ story, handleLike }) => {
  const [modalShow, setModalShow] = useState(false);
  const { user } = useUsers();

  function checkLike(e) {
    if (user) {
      handleLike(e);
    } else {
      setModalShow(true);
    }
  }
  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="like-tooltip">Bookmark the Story</Tooltip>}
      >
        <button className="action-button" onClick={(e) => checkLike(e)}>
          <img src={story.liked ? LikedIcon : LikeIcon} alt="Like Icon" />
        </button>
      </OverlayTrigger>
      <SignInModal show={modalShow} onHide={() => setModalShow(false)} />
    </>
  );
};

export default LikeButton;
