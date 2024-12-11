import React, { useState, useEffect, useRef } from "react";
import annyang from "annyang";

const SpeechToTextModal = React.memo(({ isVisible, onClose, onSubmit }) => {
  const [speechText, setSpeechText] = useState(""); // Tracks the speech-transcribed text
  const [charLimitExceeded, setCharLimitExceeded] = useState(false); // Tracks if the character limit is exceeded
  const lastSentenceRef = useRef(""); // Tracks the last processed sentence to avoid duplicates

  const CHAR_LIMIT = 300; // Define character limit

  useEffect(() => {
    if (isVisible) {
      setSpeechText(""); // Clear the text when the modal is opened
      setCharLimitExceeded(false); // Reset character limit flag
      lastSentenceRef.current = ""; // Clear last processed sentence
    }
  }, [isVisible]);

  const processPunctuation = (text) =>
    text
      .replace(/\bquestion mark\b/gi, "?")
      .replace(/\bdot\b/gi, ".")
      .replace(/\bcomma\b/gi, ",")
      .replace(/\bexclamation mark\b/gi, "!")
      .replace(/\bdash\b/gi, "-")
      .replace(/\bcolon\b/gi, ":")
      .replace(/\bsemicolon\b/gi, ";")
      .trim();

  const processText = (text) => {
    const sentences = text
      .split(".")
      .map((sentence) => sentence.trim())
      .filter(Boolean)
      .map((sentence) => sentence.charAt(0).toUpperCase() + sentence.slice(1));

    const processedText = sentences.join(". ") + (text.endsWith(".") ? "." : "");
    if (processedText.length > CHAR_LIMIT) {
      setCharLimitExceeded(true);
      return processedText.slice(0, CHAR_LIMIT).trim();
    }

    setCharLimitExceeded(false);
    return processedText;
  };

  const startListening = async (e) => {
    e.preventDefault();

    if (!annyang) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted.");
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Please enable microphone access to use speech recognition.");
      return;
    }

    // Ensure the listening session starts fresh
    annyang.abort();

    annyang.addCallback("result", (phrases) => {
      const rawPhrase = phrases[0];
      const processedPhrase = processPunctuation(rawPhrase);

      // Avoid adding duplicate sentences
      if (processedPhrase !== lastSentenceRef.current) {
        setSpeechText((prevText) => {
          const updatedText = `${prevText} ${processedPhrase}`.trim();
          lastSentenceRef.current = processedPhrase; // Update the last processed sentence
          return processText(updatedText);
        });
      }
    });

    annyang.start({ autoRestart: true, continuous: true }); // Allow continuous and seamless listening
    console.log("Speech recognition started.");
  };

  const stopListening = (e) => {
    e.preventDefault();
    if (annyang) {
      console.log("Stopping speech recognition...");
      annyang.abort();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(speechText.trim()); // Submit the transcribed text
    setSpeechText(""); // Clear state for the next use
    setCharLimitExceeded(false); // Reset character limit
    onClose(); // Close the modal
  };

  const handleCancel = (e) => {
    e.preventDefault();
    setSpeechText(""); // Reset text
    setCharLimitExceeded(false); // Reset character limit flag
    onClose(); // Close the modal
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "80%",
          maxWidth: "500px",
          boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Speech-to-Text</h2>
        <textarea
          value={speechText}
          readOnly // Make the text area readonly
          placeholder="Start talking to see text here..."
          style={{
            width: "100%",
            height: "150px",
            fontSize: "16px",
            padding: "10px",
            boxSizing: "border-box",
            backgroundColor: "#f9f9f9",
            color: "#333",
            cursor: "not-allowed", // Indicate readonly
            whiteSpace: "pre-wrap", // Preserve new lines
          }}
        />
        {charLimitExceeded && (
          <p
            style={{
              color: "red",
              marginTop: "10px",
              fontSize: "14px",
            }}
          >
            Page 1 exceeds the character limit of {CHAR_LIMIT} characters. Extra text has been trimmed.
          </p>
        )}
        <div style={{ marginTop: "10px" }}>
          <button
            onClick={startListening}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              marginRight: "10px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Start Listening
          </button>
          <button
            onClick={stopListening}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              marginRight: "10px",
              backgroundColor: "#ffc107",
              color: "black",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Stop Listening
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              marginRight: "10px",
              backgroundColor: "#007BFF",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Submit
          </button>
          <button
            onClick={handleCancel}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
});

export default SpeechToTextModal;
