import "../styles/ActionBar.css";

import React, { useState, useEffect, useContext } from "react";

import { VoicesContext } from "../contexts/voices.context.jsx";
import { useStories } from "../contexts/stories.context.jsx";

import api from "../api";

import LikeButton from "./LikeButton";
import PlayButton from "./PlayButton";
import ReadCount from "./ReadCount";
import EditDeleteButton from "./EditDeleteButton.jsx";

const ActionBar = ({ story, storyToSpeak, page, mode }) => {
  const { stories, setStories } = useStories(); //Fetched stories in Context API

  const [isReading, setIsReading] = useState(false);
  const synth = window.speechSynthesis;
  const voices = useContext(VoicesContext);

  function handleLike(e) {
    e.preventDefault(); //On Click of Like Button the Story should not open for read
    story.liked = story.liked ? false : true;

    //Call Update function & update the story like
    api
      .put(`/stories/${story.id}`, story)
      .then(() => {
        setStories([...stories]); //Update the Context Data
      })
      .catch((error) =>
        console.log("Error during story update Story Like:", error)
      );
  }

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
      {/*Like Button*/}
      <LikeButton story={story} handleLike={handleLike} />

      {/*Story Metadata*/}
      <div className="bar-story-details">
        <img src={story.front_cover} alt="Book thumbnail" />
        <h2 className="bar-title">{story.title}</h2>
        {!storyToSpeak && (
          <h2 className="bar-author">
            Echoed by {story.Author ? story.Author : "Anonymous"}
          </h2>
        )}
      </div>

      {/*View Count*/}
      {mode && mode === "View" && <ReadCount story={story}></ReadCount>}

      {/*Action Buttons*/}
      <div className="bar-actions">
        {/*Play Button*/}
        {storyToSpeak && (
          <PlayButton playStory={playStory} isReading={isReading} />
        )}

        {/*Delete Button*/}
        {mode && mode === "Edit" && (
          <EditDeleteButton story={story}></EditDeleteButton>
        )}
      </div>
    </div>
  );
};

export default ActionBar;
