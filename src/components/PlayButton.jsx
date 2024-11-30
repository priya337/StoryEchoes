import playIcon from "../assets/play.png";
import stopIcon from "../assets/stop.png";

const PlayButton = ({ playStory, isReading }) => {
  return (
    <div
      className="play-button action-button"
      onClick={playStory}
      style={{
        backgroundImage: isReading ? `url(${stopIcon})` : `url(${playIcon})`,
      }}
    ></div>
  );
};

export default PlayButton;
