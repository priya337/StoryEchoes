import playIcon from "../assets/play-media.png";
import stopIcon from "../assets/stop.png";

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const MediaButton = ({
  buttonId,
  story,
  page,
  playPageMedia,
  isMediaPlaying,
  location,
}) => {
  const screenW = window.innerWidth;

  function getMediaClasses1(loc) {
    let baseClasses = "glow-button action-button ";
    let mediaShowClass = "media-show";

    if (page > story.content.length) {
      mediaShowClass = "media-hide"; //No media on page beyond content
    } else if (page === 0) {
      mediaShowClass = "media-hide"; //No media on cover page
    } else if (screenW < 769 && loc === "right") {
      mediaShowClass = "media-hide"; //Right media only available on laptops
    } else if (loc === "left" && !story.content[page - 1].media) {
      mediaShowClass = "media-hide"; //No media on Left page
    } else if (
      loc === "right" &&
      (page >= story.content.length || !story.content[page].media)
    ) {
      mediaShowClass = "media-hide"; //No media on Right page
    }

    return baseClasses + mediaShowClass;
  }

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="media-tooltip">Play the page media</Tooltip>}
      >
        <button
          id={buttonId}
          className={getMediaClasses1(location)}
          onClick={() => playPageMedia(location)}
        >
          <img
            src={isMediaPlaying ? stopIcon : playIcon}
            alt="Play/Stop Icon"
          />
        </button>
      </OverlayTrigger>
    </>
  );
};

export default MediaButton;
