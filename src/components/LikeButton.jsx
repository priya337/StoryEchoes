import LikeIcon from "../assets/like.png";
import LikedIcon from "../assets/liked.png";

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const LikeButton = ({ story, handleLike }) => {
  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="like-tooltip">Bookmark the Story</Tooltip>}
    >
      <button className="action-button" onClick={handleLike}>
        <img src={story.liked ? LikedIcon : LikeIcon} alt="Like Icon" />
      </button>
    </OverlayTrigger>
  );
};

export default LikeButton;
