import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/EditStory.css";
import PlusIcon from "../assets/pluss.png";
import FallbackImage from "../assets/fallback.jpg";

const EditStory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [frontCover, setFrontCover] = useState("");
  const [pages, setPages] = useState([]);
  const [errors, setErrors] = useState({});
  const [beeMessage, setBeeMessage] = useState("🐝 Bzz... Click me to save your edited magical adventure. ✨");
  const [limitReached, setLimitReached] = useState(false); // Track if max pages limit is reached

  // State for tracking transcription statuses per page
  const [transcriptionStatuses, setTranscriptionStatuses] = useState({});

  const MAX_PAGES = 7;

  // Function to scroll to the first error field
  const scrollToError = () => {
    const firstErrorField = document.querySelector('.error-highlight');
    if (firstErrorField) {
      firstErrorField.scrollIntoView({
        behavior: 'smooth', // Smooth scrolling
        block: 'center', // Center the field vertically
      });
    }
  };

  // Fetch the story details from the API
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setBeeMessage("🐝 Loading your story...");
        const response = await fetch(`http://localhost:9001/stories/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch story. Status: ${response.status}`);
        }
        const data = await response.json();

        setTitle(data.title || "Untitled Story");
        setAuthor(data.Author || "Unknown Author");
        setFrontCover(data.front_cover || FallbackImage);
        setPages(data.content || []);

        // Initialize transcription statuses for each page as 'Idle'
        const initialStatuses = {};
        data.content.forEach((_, index) => {
          initialStatuses[index] = "Idle"; // Set initial status for each page as 'Idle'
        });
        setTranscriptionStatuses(initialStatuses);

        setBeeMessage("🐝 Bzz... Click me to save your edited magical adventure. ✨");
      } catch (error) {
        console.error("Error fetching story:", error);
        setBeeMessage("🐝 Oops! Couldn't load your story. Try again later.");
      }
    };

    if (id) {
      fetchStory();
    }
  }, [id]);

  // Validate form before submission
  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Oops! Every story needs a title! 🌟";
    if (!author.trim()) newErrors.author = "Oops! Add your name as the storyteller! 📖";
    if (!frontCover.trim()) newErrors.frontCover = "Oops! Your story needs a cover! 🖼️";

    // Front Cover URL validation (local path or HTTP/HTTPS URL)
    const isValidURL = (url) => {
      const regex = /^(https?:\/\/.*\.(?:jpg|jpeg|png|gif|bmp|svg|webp))$|^(.*\.(?:jpg|jpeg|png|gif|bmp|svg|webp))$/i;
      return regex.test(url);
    };

    if (frontCover && !isValidURL(frontCover)) {
      newErrors.frontCover = "Oops! Please enter a valid image URL for the front cover. 🖼️";
    }

    // Validate Page 1 for content
    if (pages.length === 1 && !pages[0].text.trim()) {
      newErrors.pages = "Oops! Story Content cannot be empty! Please add some text. ✍️";
    }

    // Validate all pages for content
    pages.forEach((page, index) => {
      if (!page.text.trim()) {
        newErrors[`page-${index}-text`] = `Oops! Page ${index + 1} is missing content! Story Content cannot be empty! ✍️`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update text for a specific page
  const handlePageTextChange = (value, index) => {
    const updatedPages = pages.map((page, i) =>
      i === index ? { ...page, text: value } : page
    );
    setPages(updatedPages);

    // Reset error for that page if text is entered
    if (value.trim()) {
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[`page-${index}-text`]; // Remove error for this page
        return updatedErrors;
      });
    } else {
      // Revalidate the error if the field is empty again
      setErrors((prevErrors) => ({
        ...prevErrors,
        [`page-${index}-text`]: `Oops! Page ${index + 1} is missing content! Story Content cannot be empty! ✍️`,
      }));
    }
  };

  // Handle file uploads for cover or page images
  const handleFileUpload = async (event, index = null) => {
    const file = event.target.files[0];
    if (!file) {
      console.error("No file selected for upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:9000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("File upload failed. Status:", response.status);
        return;
      }

      const data = await response.json();
      if (data.fileUrl) {
        if (index === null) {
          setFrontCover(data.fileUrl); // Update the front cover
        } else {
          setPages((prevPages) =>
            prevPages.map((page, i) =>
              i === index ? { ...page, image: data.fileUrl } : page
            )
          );
        }
      }
    } catch (error) {
      console.error("Error during file upload:", error);
    }
  };

  // Add a new page
// Add a new page only if the current page has content
const addPage = () => {
  // Check if the current page has content
  const currentPageIndex = pages.length - 1;
  if (!pages[currentPageIndex]?.text.trim()) {
    // If the current page content is empty, show the error for that page
    setErrors((prevErrors) => ({
      ...prevErrors,
      [`page-${currentPageIndex}-text`]: `Oops! Page ${currentPageIndex + 1} is missing content! Story Content cannot be empty! ✍️`,
    }));
    return; // Prevent adding a new page
  }

  // If current page has content, allow adding the next page
  if (pages.length < MAX_PAGES) {
    const newPage = { page: pages.length + 1, text: "", image: "" };
    setPages((prevPages) => [...prevPages, newPage]);

    // Clear any error related to page content for the new page
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[`page-${currentPageIndex}-text`]; // Remove error for current page if it's filled
      return updatedErrors;
    });
  }

  // Show a message if max pages are reached
  if (pages.length + 1 === MAX_PAGES) {
    setLimitReached(true);
  }
};


  // Handle start of transcription for each page
  const handleStartTranscription = (index) => {
    // Set transcription status to 'In Progress' for the current page
    setTranscriptionStatuses((prevStatuses) => ({
      ...prevStatuses,
      [index]: "In Progress...",
    }));

    // Simulate transcription process (replace with actual transcription logic/API)
    setTimeout(() => {
      // After transcription completes, update the status to 'Completed ✅'
      setTranscriptionStatuses((prevStatuses) => ({
        ...prevStatuses,
        [index]: "Completed ✅",
      }));

      // Optionally, update the page content with transcribed text (simulated content)
      const updatedPages = [...pages];
      updatedPages[index].text = "This is the transcribed content!"; // Replace with actual transcription result
      setPages(updatedPages);

      // Optional: Change bee message after transcription
      setBeeMessage("🐝 Transcription completed! You can continue editing your story.");
    }, 3000); // Simulate 3-second transcription delay
  };

  // Delete page logic and reorder pages after deletion
  const deletePage = (indexToDelete) => {
    const updatedPages = pages.filter((_, index) => index !== indexToDelete);

    // Reorder pages: reset page numbers to be in correct order
    const reorderedPages = updatedPages.map((page, index) => ({
      ...page,
      page: index + 1, // Update page numbers after deletion
    }));

    setPages(reorderedPages);

    if (reorderedPages.length < MAX_PAGES) {
      setLimitReached(false);
    }
  };

  // Front Cover Change Handler
  const handleFrontCoverChange = (e) => {
    const value = e.target.value;
    setFrontCover(value);

    // Validate URL
    const isValidURL = (url) => {
      const regex = /^(https?:\/\/.*\.(?:jpg|jpeg|png|gif|bmp|svg|webp))$|^(.*\.(?:jpg|jpeg|png|gif|bmp|svg|webp))$/i;
      if (!regex.test(url)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          frontCover: "Oops! Please enter a valid image URL for the front cover. 🖼️",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          frontCover: "",
        }));
      }
    };

    if (value.trim()) {
      isValidURL(value);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validate()) {
      scrollToError();
      return;
    }

    const story = {
      id,
      title,
      Author: author,
      front_cover: frontCover || FallbackImage,
      content: pages.map((page) => ({
        ...page,
        image: page.image || FallbackImage,
      })),
    };

    try {
      setBeeMessage("🐝 Saving your edits...");
      const response = await fetch(`http://localhost:9001/stories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(story),
      });

      if (response.ok) {
        setBeeMessage("Awesome! Your story has been saved! 🚀");
        setTimeout(() => {
          navigate(`/read-story/${id}`);
        }, 2000);
      } else {
        setBeeMessage("🐝 Oh no! Couldn't save your story. Try again.");
      }
    } catch (error) {
      console.error("Error saving story:", error);
      setBeeMessage("🐝 Something went wrong. Please try again.");
    }
  };

  return (
    <div className="edit-story-container">
      <h1>Edit Your Magical Story</h1>
      <form className="story-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {/* Title and Author */}
        <div className="row">
          <div
            id="title"
            className={`form-group ${
              errors.title ? "error-highlight" : title.trim() ? "success-highlight" : ""
            }`}
          >
            <label>Title</label>
            <input
              type="text"
              value={title || ""}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) {
                  setErrors((prevErrors) => ({ ...prevErrors, title: "" }));
                }
              }}
              onBlur={() => validate()}
            />
            {errors.title && <span className="error">{errors.title}</span>}
          </div>
          <div
            id="author"
            className={`form-group ${
              errors.author ? "error-highlight" : author.trim() ? "success-highlight" : ""
            }`}
          >
            <label>Author</label>
            <input
              type="text"
              value={author || ""}
              onChange={(e) => {
                setAuthor(e.target.value);
                if (e.target.value.trim()) {
                  setErrors((prevErrors) => ({ ...prevErrors, author: "" }));
                }
              }}
              onBlur={() => validate()}
            />
            {errors.author && <span className="error">{errors.author}</span>}
          </div>
        </div>

        {/* Front Cover */}
        <div
          id="frontCover"
          className={`form-group front-cover-group ${
            errors.frontCover ? "error-highlight" : frontCover.trim() && !errors.frontCover ? "success-highlight" : ""
          }`}
        >
          <label>Front Cover (local Path/URL)</label>
          <input
            type="text"
            value={frontCover || ""}
            onChange={handleFrontCoverChange} // Link the function here
            onBlur={() => validate()}
          />
          {errors.frontCover && <span className="error">{errors.frontCover}</span>}
          <input
            type="file"
            accept="image/*"
            id="front-cover-upload"
            style={{ display: "none" }}
            onChange={(e) => handleFileUpload(e)}
          />
          <label htmlFor="front-cover-upload">
            <img src={PlusIcon} alt="Upload Front Cover" className="add-image-icon" />
          </label>
        </div>

        {/* Pages Section */}
        <div className="pages-container">
          {pages.map((page, index) => (
            <div key={index} className="page-input-group">
              <h3>Page {page.page}</h3>
              <label>Story Content</label>
              <div style={{ textAlign: "center", fontFamily: "'Bubblegum Sans', cursive" }}>
                <div
                  className="honey-bee-transcription"
                  onClick={() => handleStartTranscription(index)}
                  style={{ cursor: "pointer", fontSize: "1rem" }}
                >
                  <p>🐝 Bzz... Click me to save your magical tale. ✨</p>
                </div>
                <div
                  className="transcription-status"
                  style={{
                    fontWeight: "bold",
                    color: transcriptionStatuses[index] === "Idle" ? "magenta" : "blue",
                    fontSize: "1rem",
                  }}
                >
                  Status: {transcriptionStatuses[index] || "Idle"}
                </div>
              </div>

              <textarea
                value={page.text || ""}
                onChange={(e) => handlePageTextChange(e.target.value, index)}
                onBlur={() => validate()}
                className={
                  errors[`page-${index}-text`] ? "error-highlight" : page.text.trim() ? "success-highlight" : ""
                }
              />
              {errors[`page-${index}-text`] && <span className="error">{errors[`page-${index}-text`]}</span>}
              <label>Image URL</label>
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
                <img src={PlusIcon} alt="Upload Page Image" className="add-image-icon" />
              </label>

              {/* Add and Delete Page Buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {pages.length < MAX_PAGES && (
                  <button
                    type="button"
                    className="add-page-button"
                    onClick={addPage}
                    style={{
                      position: "absolute",
                      top: "5px", // Adjust this to set the distance from the top
                      right: "80px", // Adjust this to set the distance from the right edge
                      backgroundColor: "#f44336",
                      color: "white",
                      padding: "0.5rem 1rem",
                      borderRadius: "5px",
                    }}
                  >
              
                  </button>
                )}
                <button
                  type="button"
                  className="delete-page-button"
                  onClick={() => deletePage(index)}
                  style={{
                    display: index === -1 || pages.length === 1 ? "none" : "block",
                  }}
                >
                </button>
              </div>
            </div>
          ))}

          {/* Maximum Pages Reached Message */}
          {limitReached && (
            <div
              className="limit-message"
              style={{ textAlign: "center", fontSize: "1rem", color: "#003d99", marginTop: "20px" }}
            >
              🎉 You’ve reached the maximum of 7 pages. Time to wrap up your story! 🦄
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="honey-bee-message" onClick={handleSubmit} style={{ cursor: "pointer" }}>
          <p>{beeMessage}</p>
        </div>
      </form>
    </div>
  );
};

export default EditStory;
