import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddStory.css";
import { API_URL } from "../config/apiConfig.js";

// Import assets
import PlusIcon from "../assets/pluss.png";

const AddStory = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [frontCover, setFrontCover] = useState(""); // Stores server URL for the uploaded file
  const [pages, setPages] = useState([{ page: 1, text: "", image: "" }]); // Stores pages with text and image URLs
  const [errors, setErrors] = useState({});
  const [limitReached, setLimitReached] = useState(false);
  const [beeMessage, setBeeMessage] = useState(
    "🐝 Bzzz... Click me to submit your story!"
  ); // Default message
  const navigate = useNavigate();

  const MAX_PAGES = 7;

  // Add a new page
  const addPage = () => {
    if (pages.length < MAX_PAGES) {
      setPages((prevPages) => [
        ...prevPages,
        { page: prevPages.length + 1, text: "", image: "" },
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
      newErrors.frontCover =
        "Your story needs a cover! Add an image URL or file path. 🖼️";

    const emptyPages = pages.filter((page) => !page.text.trim());
    if (emptyPages.length > 0)
      newErrors.pages = `Oops! Page ${emptyPages[0].page} needs some story magic. 🌟`;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validate()) return;

    const story = {
      title,
      author,
      front_cover: frontCover,
      content: pages,
    };

    try {
      setBeeMessage("🐝 Submitting your story...");
      const response = await fetch(`${API_URL}/stories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(story),
      });

      if (response.ok) {
        const responseData = await response.json();
        setBeeMessage("🐝 Hooray! Your story has been submitted successfully!");
        setTimeout(() => {
          setBeeMessage("🐝 Click me to submit another story!");
          navigate(`/read-story/${responseData.id}`);
        }, 3000);
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
          <div
            className={`form-group ${errors.title ? "error-highlight" : ""}`}
          >
            <label>Title</label>
            <input
              type="text"
              value={title || ""}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <span className="error">{errors.title}</span>}
          </div>

          <div
            className={`form-group ${errors.author ? "error-highlight" : ""}`}
          >
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
              <textarea
                value={page.text || ""}
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
              <div className="page-buttons">
                {index === pages.length - 1 && !limitReached && (
                  <button
                    type="button"
                    className="add-page-button"
                    onClick={addPage}
                  ></button>
                )}
                {pages.length > 1 && (
                  <button
                    type="button"
                    className="delete-page-button"
                    onClick={() => deletePage(index)}
                  ></button>
                )}
              </div>
            </div>
          ))}
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
};

export default AddStory;
