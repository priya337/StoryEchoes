import React, { useState } from "react";

const RevAiIntegration = ({ onTranscriptionComplete, onStartTranscription }) => {
  const [status, setStatus] = useState("Idle");

  const handleTranscription = async () => {
    try {
      setStatus("Submitting...");
      onStartTranscription(); // Notify parent that transcription is starting

      // Replace `YOUR_ACCESS_TOKEN` with the actual Rev.ai API token
      const API_TOKEN = "02DABoccDa0QvDBnD-86UUd3B-BIfbreH6jgpc1xTkJ7caWRM8DOmXSdPz5WQgowGNBoX8r0oWxpEEVjb8SBlSGLtPMU4";

      // Simulate file submission
      const audioFile = new Blob(); // Replace with actual audio file
      const formData = new FormData();
      formData.append("media", audioFile);

      const response = await fetch("https://api.rev.ai/speechtotext/v1/jobs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit the audio file for transcription");
      }

      const job = await response.json();
      setStatus(`Job Submitted: ${job.id}`);

      // Poll for transcription status
      const pollInterval = setInterval(async () => {
        const statusResponse = await fetch(
          `https://api.rev.ai/speechtotext/v1/jobs/${job.id}`,
          { headers: { Authorization: `Bearer ${API_TOKEN}` } }
        );
        const statusData = await statusResponse.json();

        if (statusData.status === "completed") {
          clearInterval(pollInterval);

          const transcriptResponse = await fetch(
            `https://api.rev.ai/speechtotext/v1/jobs/${job.id}/transcript`,
            { headers: { Authorization: `Bearer ${API_TOKEN}` } }
          );

          if (!transcriptResponse.ok) {
            throw new Error("Failed to fetch the transcription");
          }

          const transcript = await transcriptResponse.text();
          setStatus("Completed");
          onTranscriptionComplete(transcript); // Notify parent with the transcription result
        } else if (statusData.status === "failed") {
          clearInterval(pollInterval);
          setStatus("Failed");
          console.error("Transcription failed:", statusData);
        }
      }, 5000); // Poll every 5 seconds
    } catch (error) {
      setStatus("Error occurred");
      console.error("Error during transcription:", error);
    }
  };

  return (
    <button onClick={handleTranscription} className="transcription-button">
      Start Transcription
    </button>
  );
};

export default RevAiIntegration;
