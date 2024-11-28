import "../styles/ActionBar.css";
import play from "../assets/play.png";
import stop from "../assets/stop.png";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ActionBar = ({ story, storyToSpeak, page }) => {
  const [isReading, setIsReading] = useState(false);
  const [voices, setVoices] = useState([]);
  const synth = window.speechSynthesis;
  let voice;

  function populateVoiceList() {
    //Searching for a Female voice for story narration
    if (typeof speechSynthesis === "undefined") {
      return;
    }

    voice = speechSynthesis
      .getVoices()
      .filter((voice) => voice.name.toUpperCase().search("FEMALE") >= 0);
    setVoices[voice];
  }

  const playStory = () => {
    if (isReading) {
      synth.cancel(); // Stop any ongoing narration
    } else {
      const utterance = new SpeechSynthesisUtterance(storyToSpeak);
      if (voice && voice.length > 0) {
        utterance.voice = voice[0];
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

    if (storyToSpeak) {
      populateVoiceList();
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
