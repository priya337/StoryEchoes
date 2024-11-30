import LikeIcon from "../assets/like.png";
import LikedIcon from "../assets/liked.png";

const LikeButton = ({ story, handleLike }) => {
  return (
    <div
      className="like-button action-button"
      style={{
        backgroundImage: `url(${story.liked ? LikedIcon : LikeIcon})`,
      }}
      onClick={handleLike}
    ></div>
  );
};

export default LikeButton;
