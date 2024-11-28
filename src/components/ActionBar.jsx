import "../styles/ActionBar.css";
import play from "../assets/play.png";
import stop from "../assets/stop.png";

import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import { VoicesContext } from "../contexts/voices.context.jsx";

const ActionBar = ({ story, storyToSpeak, page }) => {
  const [isReading, setIsReading] = useState(false);
  const synth = window.speechSynthesis;
  const voices = useContext(VoicesContext);

  const playStory = () => {
    if (isReading) {
      synth.cancel(); // Stop any ongoing narration
    } else {
      //Create utterance & add end even to change Reading icon back to play
      const utterance = new SpeechSynthesisUtterance(storyToSpeak);
      utterance.addEventListener("end", () => setIsReading((prev) => !prev));

      //We play on the Female voice if available
      if (voices && voices.length > 0) {
        utterance.voice = voices[0];
        synth.speak(utterance);
      } else {
        window.speechSynthesis.speak(utterance); //Fallback voice
      }
    }
    setIsReading((prev) => !prev);
  };

  useEffect(() => {
    if (isReading) {
      // Stop any ongoing narration on Page flips
      synth.cancel();
      setIsReading((prev) => !prev);
    }
  }, [page]);

  useEffect(() => {
    return () => synth.cancel(); //Cleanup on Unmount
  }, [synth]);

  return (
    <div className="action-bar">
      {/*Story Metadata*/}
      <div className="bar-story-details">
        <img src={story.front_cover} alt="Book thumbnail" />
        <h2 className="bar-title">{story.title}</h2>
        <h2 className="bar-author">
          Echoed by {story.author ? story.author : "Anonymous"}
        </h2>
      </div>

      {/*Action Buttons*/}
      <div className="bar-actions">
        {storyToSpeak && (
          <div
            className="play-button action-button"
            onClick={playStory}
            style={{
              backgroundImage: isReading ? `url(${stop})` : `url(${play})`,
            }}
          ></div>
        )}
        <div className="delete-button action-button"></div>
        <Link to={`/editStory/${story.id}`}>
          <button className="edit-button action-button"></button>
        </Link>
      </div>
    </div>
  );
};

export default ActionBar;
