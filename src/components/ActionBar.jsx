import "../styles/ActionBar.css";
import play from "../assets/play.png";
import stop from "../assets/stop.png";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ActionBar = ({ story, storyToSpeak }) => {
  const [isReading, setIsReading] = useState(false);
  const synth = window.speechSynthesis;

  function populateVoiceList() {
    if (typeof speechSynthesis === "undefined") {
      return;
    }

    const voices = speechSynthesis
      .getVoices()
      .filter((voice) => voice.lang === "en-US");

    for (let i = 0; i < voices.length; i++) {
      const option = document.createElement("option");
      option.textContent = `${voices[i].name} (${voices[i].lang})`;

      if (voices[i].default) {
        option.textContent += " — DEFAULT";
      }

      option.setAttribute("data-lang", voices[i].lang);
      option.setAttribute("data-name", voices[i].name);
      //document.getElementById("voiceSelect").appendChild(option);
    }
  }

  const playStory = () => {
    if (isReading) {
      synth.cancel(); // Stop any ongoing speech
    } else {
      const utterance = new SpeechSynthesisUtterance(storyToSpeak);
      window.speechSynthesis.speak(utterance);
    }
    setIsReading((prev) => !prev);
  };

  useEffect(() => {
    if (storyToSpeak) {
      populateVoiceList();
    }
  }, []);

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
