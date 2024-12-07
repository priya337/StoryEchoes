import "../styles/ActionBar.css";
import React, { useState, useEffect, useContext } from "react";

import { VoicesContext } from "../contexts/voices.context.jsx";
import { useUsers } from "../contexts/user.context.jsx";
import api from "../api";

import LikeButton from "./LikeButton";
import PlayButton from "./PlayButton";
import ReadCount from "./ReadCount";
import EditDeleteButton from "./EditDeleteButton.jsx";

const ActionBar = ({ story, storyToSpeak, page, mode }) => {
  const { user, userDetails, setUserDetails } = useUsers(); //Fetched stories in Context API

  const [isReading, setIsReading] = useState(false);
  const synth = window.speechSynthesis;
  const voices = useContext(VoicesContext);
  //Create utterance
  const utterance = new SpeechSynthesisUtterance();

  function handleLike(e) {
    e.preventDefault(); //On Click of Like Button the Story should not open for read

    if (!user) return;

    if (userDetails.bookIds.includes(story.id)) {
      // Disliked the book
      userDetails.bookIds = userDetails.bookIds.filter((id) => id !== story.id);
    } else {
      // Liked the book
      userDetails.bookIds.push(story.id);
    }

    //Call Update function & update the story like
    api
      .put(`/users/${userDetails.id}`, userDetails)
      .then(({ data }) => {
        setUserDetails(data);
      })
      .catch((error) =>
        console.log("Error during story update Story Like:", error)
      );
  }

  const playStory = () => {
    if (isReading) {
      synth.cancel(); // Stop any ongoing narration
    } else {
      utterance.text = storyToSpeak.slice(0, 180);
      storyToSpeak = storyToSpeak.slice(180);
      speak();

      //Add end event to change Reading icon back to play
      //or continue with next 180char text if story not finished(Prob playing more than 180 chars).
      utterance.addEventListener("end", () => {
        if (storyToSpeak) {
          utterance.text = storyToSpeak.slice(0, 180);
          storyToSpeak = storyToSpeak.slice(180);
          speak();
        } else {
          setIsReading((prev) => !prev);
        }
      });
    }
    setIsReading((prev) => !prev);
  };

  const speak = () => {
    //We play on the Female voice if available
    if (voices && voices.length > 0) {
      utterance.voice = voices[0];
      synth.speak(utterance);
    } else {
      window.speechSynthesis.speak(utterance); //Fallback voice
    }
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
            Echoed by {story.author ? story.author : "Anonymous"}
          </h2>
        )}
      </div>

      {/*View Count*/}
      {mode && mode === "View" && <ReadCount story={story}></ReadCount>}

      {/*Action Buttons*/}
      {mode && mode === "Edit" && (
        <div className="bar-actions">
          {/*Play Button*/}
          {storyToSpeak && (
            <PlayButton playStory={playStory} isReading={isReading} />
          )}

          {/*Delete Button*/}

          <EditDeleteButton story={story}></EditDeleteButton>
        </div>
      )}
    </div>
  );
};

export default ActionBar;
