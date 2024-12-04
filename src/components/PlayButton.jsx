import playIcon from "../assets/play.png";
import stopIcon from "../assets/stop.png";

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const PlayButton = ({ playStory, isReading }) => {
  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id="play-stop-tooltip">
          {isReading ? "Stop the Story Narration" : "Narrate the Story"}
        </Tooltip>
      }
    >
      <button className="action-button" onClick={playStory}>
        <img src={isReading ? stopIcon : playIcon} alt="Play/Stop Icon" />
      </button>
    </OverlayTrigger>
  );
};

export default PlayButton;
