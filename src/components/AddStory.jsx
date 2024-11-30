import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddStory.css";
import RevAiIntegration from "./RevAiIntegration";

// Import assets
import PlusIcon from "../assets/pluss.png";
import FallbackImage from "../assets/fallback.jpg"; 


const AddStory = () => {
  const [isStoryAdded, setIsStoryAdded] = useState(false); // Track if the story is added
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [frontCover, setFrontCover] = useState(""); // Stores server URL for the uploaded file
  const [pages, setPages] = useState([{ page: 1, text: "", image: "" }]); // Stores pages with text and image URLs
  const [errors, setErrors] = useState({});
  const [limitReached, setLimitReached] = useState(false);
  const [beeMessage, setBeeMessage] = useState("🐝 Bzzz... Click me to submit your story!"); // Default message
  const [transcriptionStatus, setTranscriptionStatus] = useState("Idle"); // For transcription status updates
  const navigate = useNavigate();
  const MAX_PAGES = 7;

  // Add a new page
  const addPage = (transcription = "") => {
    if (pages.length < MAX_PAGES) {
      setPages((prevPages) => [
        ...prevPages,
        { page: prevPages.length + 1, text: transcription, image: "" },
      ]);
    }
    if (pages.length + 1 === MAX_PAGES) {
      setLimitReached(true);
    }
  };

  // Delete a page and reorder remaining pages
  const deletePage = (indexToDelete) => {
    const updatedPages = pages
      .filter((_, index) => index !== indexToDelete)
      .map((page, index) => ({
        ...page,
        page: index + 1,
      }));

    setPages(updatedPages);

    if (updatedPages.length < MAX_PAGES) {
      setLimitReached(false);
    }
  };

  // Handle text changes in pages
  const handlePageTextChange = (value, index) => {
    const updatedPages = pages.map((page, i) =>
      i === index ? { ...page, text: value } : page
    );
    setPages(updatedPages);

    if (value.trim() && !beeMessage.includes("🐝 Ready")) {
      setBeeMessage("🐝 Ready to submit your story? Click me!");
    }
  };

  // Handle file upload for front cover and page images
  const handleFileUpload = async (event, index = null) => {
    const file = event.target.files[0];
    if (!file) {
      console.error("No file selected for upload.");
      return;
    }

    console.log("Uploading file:", file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:9000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("File upload failed. Status:", response.status);
        console.error("Response body:", await response.text());
        return;
      }

      const data = await response.json();
      console.log("Server response for file upload:", data);

      // Validate the returned file URL
      if (data.fileUrl) {
        console.log("Valid file path received:", data.fileUrl);

        if (index === null) {
          setFrontCover(data.fileUrl); // Update the front cover URL
        } else {
          setPages((prevPages) =>
            prevPages.map((page, i) =>
              i === index ? { ...page, image: data.fileUrl } : page
            )
          );
        }
      } else {
        console.error("Invalid file path received from the server.");
      }
    } catch (error) {
      console.error("Error during file upload:", error);
    }
  };

  // Validation function
  const validate = () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = "Every story needs a title! ✨";
    if (!author.trim())
      newErrors.author = "Who is the storyteller? Add your name! 📖";
    if (!frontCover.trim())
      newErrors.frontCover = "Your story needs a cover! Add an image URL or file path. 🖼️";

    const emptyPages = pages.filter((page) => !page.text.trim());
    if (emptyPages.length > 0)
      newErrors.pages = `Oops! Page ${emptyPages[0].page} needs some story magic. 🌟`;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle transcription completion
  const handleTranscriptionComplete = (transcription) => {
    addPage(transcription); // Add transcription to a new page
    setBeeMessage("🐝 Transcription added! Keep creating your magical adventure!");
    setTranscriptionStatus("Completed ✅");
  };

  // Start transcription process
  const handleStartTranscription = () => {
    setBeeMessage("🐝 Transcription in progress... Hang tight!");
    setTranscriptionStatus("In Progress...");
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validate()) return;
  
    // Prepare the story object with fallback images for missing image URLs
    const story = {
      title,
      author,
      front_cover: frontCover || FallbackImage, // Use fallback image for front cover if missing
      content: pages.map((page) => ({
        ...page,
        image: page.image || FallbackImage, // Use fallback image for missing page images
      })),
    };
  
    try {
      setBeeMessage("🐝 Submitting your story...");
      const response = await fetch("http://localhost:9001/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(story), // Send the prepared story with fallback images
      });
  
      if (response.ok) {
        const responseData = await response.json();
        setBeeMessage("🐝 Hooray! Your story has been submitted successfully!");
        setIsStoryAdded(true); // Set the state to true after story is successfully added
        setTimeout(() => {
          setBeeMessage("🐝 Click me to submit another story!");
          navigate(`/read-story/${responseData.id}`); // Navigate to the submitted story
        }, 2000);
      } else {
        setBeeMessage("🐝 Oops! Failed to submit your story. Try again.");
        console.error("Failed to add story.");
      }
    } catch (error) {
      setBeeMessage("🐝 Error submitting your story. Please try again.");
      console.error("Error submitting story:", error);
    }
  };
  
  return (
    <div className="add-story-container">
  
      <h1>Create Your Magical Adventure</h1>
  
      <form className="story-form">
        <div className="row">
          <div className={`form-group ${errors.title ? "error-highlight" : ""}`}>
            <label>Title</label>
            <input
              type="text"
              value={title || ""}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <span className="error">{errors.title}</span>}
          </div>
  
          <div className={`form-group ${errors.author ? "error-highlight" : ""}`}>
            <label>Author</label>
            <input
              type="text"
              value={author || ""}
              onChange={(e) => setAuthor(e.target.value)}
            />
            {errors.author && <span className="error">{errors.author}</span>}
          </div>
        </div>
  
        <div
          className={`form-group front-cover-group ${
            errors.frontCover ? "error-highlight" : ""
          }`}
        >
          <label>Front Cover (local Path/URL)</label>
          <input
            type="text"
            value={frontCover || ""}
            onChange={(e) => setFrontCover(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            id="front-cover-upload"
            style={{ display: "none" }}
            onChange={(e) => handleFileUpload(e)}
          />
          <label htmlFor="front-cover-upload">
            <img
              src={PlusIcon}
              alt="Upload Front Cover"
              className="add-image-icon"
            />
          </label>
          {errors.frontCover && (
            <span className="error">{errors.frontCover}</span>
          )}
        </div>
        
        <div className="pages-container">
  {pages.map((page, index) => (
    <div key={index} className="page-input-group">
      <h3>Page {page.page}</h3>
      <label>Story Content</label>
      <div
  style={{
    textAlign: "center", // Center both elements
    fontFamily: "'Bubblegum Sans', cursive", // Font applied
  }}
>
  <div
    className="honey-bee-transcription"
    onClick={handleStartTranscription} // Ensure this function exists in your component
    style={{
      cursor: "pointer",
      fontSize: "1rem",
    }}
  >
    <p>🐝 Bzz... Click me to weave your magical tale. ✨</p>
  </div>

  <div
    className="transcription-status"
    style={{
      fontWeight: "bold",
      color:
        transcriptionStatus === "Idle"
          ? "magenta"
          : "blue", // Dark blue for statuses other than Idle
      fontSize: "1rem",
    }}
  >
    Status: {transcriptionStatus}
  </div>
</div>
      <textarea
        value={typeof page.text === "string" ? page.text : ""}
        onChange={(e) => handlePageTextChange(e.target.value, index)}
      />
      <label>Image URL (local Path/URL)</label>
      <input
        type="text"
        value={page.image || ""}
        onChange={(e) =>
          setPages((prevPages) =>
            prevPages.map((p, i) =>
              i === index ? { ...p, image: e.target.value } : p
            )
          )
        }
      />
      <input
        type="file"
        accept="image/*"
        id={`image-upload-${index}`}
        style={{ display: "none" }}
        onChange={(e) => handleFileUpload(e, index)}
      />
      <label htmlFor={`image-upload-${index}`}>
        <img
          src={PlusIcon}
          alt="Upload Image"
          className="add-image-icon"
        />
      </label>

      {/* Add/Delete Page Buttons */}
      <div className="page-buttons" style={{ marginTop: "1rem" }}>
        {index === pages.length - 1 && !limitReached && (
          <button
            type="button"
            className="add-page-button"
            onClick={addPage}
            style={{
              cursor: "pointer",
              marginRight: "1rem",
              backgroundColor: "#4caf50",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "5px",
            }}
          >
          </button>
        )}
        {pages.length > 1 && (
          <button
            type="button"
            className="delete-page-button"
            onClick={() => deletePage(index)}
            style={{
              cursor: "pointer",
              backgroundColor: "#f44336",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "5px",
            }}
          >
          </button>
        )}
      </div>
    </div>
  ))}
</div>

{/* Single Bee Button Outside Pages Container */}
<div>
          {limitReached && (
            <div className="limit-message">
              🎉 You’ve reached the maximum of 7 pages. Time to wrap up your
              story! 🦄
            </div>
          )}
          {errors.pages && <span className="error">{errors.pages}</span>}
        </div>
  
        {/* Honey Bee Submit Button */}
        <div
          className="honey-bee-message"
          onClick={handleSubmit}
          style={{ cursor: "pointer", fontSize: "2rem", textAlign: "center" }}
        >
          <p>{beeMessage}</p>
        </div>
      </form>
    </div>
  );
}  
export default AddStory;
