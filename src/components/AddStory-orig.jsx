import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddStory.css";
import FallbackImage from "../assets/fallback.jpg";
import axios from "axios";
import { API_URL } from "../config/apiConfig.js";
import PollinationImage from "./PollinationImage"; // Import the PollinationImage component

const AddStory = () => {
  const INITIAL_PAGES = [];
  const INITIAL_ERRORS = {};
  const INITIAL_GENERAL_ERROR_MESSAGE = "";
  const [isStoryAdded, setIsStoryAdded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [title, setTitle] = useState("");
  const [imageGenerated, setImageGenerated] = useState(false);
  const [author, setAuthor] = useState("");
  const [frontCover, setFrontCover] = useState("");
  const [temporaryComponent, setTemporaryComponent] = useState(null);
  const [generalErrorMessage, setGeneralErrorMessage] = useState(); // State for error message
  const updatePages = (updatedPages) => {
    setPages(updatedPages);
  };
  const CHARACTER_LIMIT = 300;

  // Ensure all pages have an id before performing operations
  const ensurePageIds = () => {
    setPages((prevPages) =>
      prevPages.map((page) => ({
        ...page,
        id: page.id || `page-${Date.now()}-${Math.random()}`, // Assign unique id if missing
      }))
    );
  };

  const scrollToPage = (pageIndex) => {
    const pageElement = document.querySelector(
      `[data-page-index="${pageIndex}"]`
    );
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const movePage = (pageIndex, direction) => {
    setPages((prevPages) => {
      const targetIndex = direction === "up" ? pageIndex - 1 : pageIndex + 1;

      // Ensure the target index is within bounds
      if (targetIndex < 0 || targetIndex >= prevPages.length) {
        return prevPages;
      }

      // Create a copy of the pages array
      const updatedPages = [...prevPages];

      // Swap the pages (explicitly handling all fields, including media)
      const temp = { ...updatedPages[pageIndex] }; // Temporarily store the current page
      updatedPages[pageIndex] = {
        ...updatedPages[targetIndex],
        page: pageIndex + 1, // Update page number
      };
      updatedPages[targetIndex] = {
        ...temp,
        page: targetIndex + 1, // Update page number
      };

      // Reset any file inputs if necessary (optional, if using file input fields)
      if (fileInputRefs.current[pageIndex]) {
        fileInputRefs.current[pageIndex].value = null; // Reset file input for the current page
      }
      if (fileInputRefs.current[targetIndex]) {
        fileInputRefs.current[targetIndex].value = null; // Reset file input for the target page
      }

      // Return the updated pages
      return updatedPages;
    });
  };

  useEffect(() => {
    if (generalErrorMessage && pagesContainerRef.current) {
      // Scroll to the bottom of the container when a general message is set
      pagesContainerRef.current.scrollTo({
        top: pagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [generalErrorMessage]);

  const [pages, setPages] = useState([
    {
      page: 1,
      text: "",
      image: null,
      audio: null,
      imageFileName: "", // Track image file name
      audioFileName: "", // Track audio file name
      mediaUrl: "",
      // beeMessage: "🐝 Click me to narrate your magical tale!",
      // transcriptionStatus: "Idle",
      imageError: null,
      audioError: null,
      mediaUrlError: null,
      isPlaying: false, // Track audio playing state
      audioInstance: null, // Store audio instance
      isGenerating: false, // Track if AI image is being generated
      imageGenerated: false,
    },
  ]);
  const [errors, setErrors] = useState({ INITIAL_ERRORS });
  const [limitReached, setLimitReached] = useState(false);
  const [beeSubmitMessage, setBeeSubmitMessage] = useState(
    "🐝 Bzzz... Click me to submit your story!"
  );
  const navigate = useNavigate();
  const MAX_PAGES = 7;
  const [characterLimitExceeded, setCharacterLimitExceeded] = useState({});

  const pagesContainerRef = useRef(null);
  const fileInputRefs = useRef([]); // Create a ref array for file inputs

  // Auto-scroll functionality
  useEffect(() => {
    if (pages.length > 0) {
      const firstErrorField = document.querySelector(".error-highlight");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [pages, errors]);

  useEffect(() => {
    console.log("Pages updated:", pages);
  }, [pages]);

  const scrollToErrors = () => {
    const errorFields = document.querySelectorAll(".error-highlight");
    if (errorFields.length > 0) {
      errorFields.forEach((field, i) => {
        setTimeout(() => {
          field.scrollIntoView({ behavior: "smooth", block: "center" });
        }, i * 300); // Delay scrolling to avoid overlapping
      });
    }
  };

  // Call this during validation
  scrollToErrors();

  const handleImageGenerated = async (index, text) => {
    try {
      console.log("Starting image generation process...");

      // Step 1: Update state to indicate generation in progress
      setPages((prevPages) =>
        prevPages.map((p, i) =>
          i === index ? { ...p, isGenerating: true, imageGenerated: false } : p
        )
      );

      // Step 2: Dynamically render PollinationImage and generate the image
      const generatedImageUrl = await new Promise((resolve, reject) => {
        if (
          !setTemporaryComponent ||
          typeof setTemporaryComponent !== "function"
        ) {
          const error = new Error("setTemporaryComponent is not available.");
          console.error(error.message);
          reject(error);
          return;
        }

        setTemporaryComponent(
          <PollinationImage
            prompt={text}
            onComplete={(url) => {
              if (!url) {
                const error = new Error(
                  "Image generation failed: No URL returned."
                );
                console.error(error.message);
                reject(error);
                setTemporaryComponent(null); // Clean up
                return;
              }
              console.log("Image generated successfully:", url);
              resolve(url); // Resolve the Promise with the image URL
              setTemporaryComponent(null); // Clean up after success
            }}
            onError={(error) => {
              console.error("Image generation failed:", error);
              reject(error); // Reject with the error
              setTemporaryComponent(null); // Clean up after failure
            }}
          />
        );
      });

      if (fileInputRefs.current[index]) {
        fileInputRefs.current[index].value = null; // Reset the file input field
      }

      // Step 3: Upload the generated image to Cloudinary
      console.log("Uploading generated image to Cloudinary...");
      const uploadedUrl = await uploadImageToCloudinary(generatedImageUrl);
      console.log("Image uploaded to Cloudinary successfully:", uploadedUrl);

      // Step 4: Save the uploaded image URL to the database
      console.log("Saving the uploaded image URL to the database...");
      await saveImageUrlToDatabase(uploadedUrl, index);
      console.log("Image URL saved successfully in the database.");

      // Step 5: Update state with the uploaded image
      setPages((prevPages) =>
        prevPages.map((p, i) =>
          i === index
            ? {
                ...p,
                image: uploadedUrl,
                imageGenerated: true,
                isGenerating: false,
              }
            : p
        )
      );

      console.log(
        "Image generation and upload process completed successfully."
      );
    } catch (error) {
      console.error("Error during the image generation process:", error);

      // Alert the user about the error
      alert(
        "An error occurred during the image generation process. Please try again."
      );

      // Reset state in case of an error
      setPages((prevPages) =>
        prevPages.map((p, i) =>
          i === index ? { ...p, isGenerating: false } : p
        )
      );
    }
  };

  const uploadImageToCloudinary = async (imageFile) => {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "StoryEchoes");

    console.time("Cloudinary API Call");
    try {
      console.log("Uploading image to Cloudinary...");
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dhxwg8gcz/upload",
        formData
      );
      console.log("Cloudinary response:", response.data);
      console.timeEnd("Cloudinary API Call");
      return response.data.secure_url; // Return the URL of the uploaded image
    } catch (error) {
      console.error("Error during Cloudinary upload:", error);
      console.timeEnd("Cloudinary API Call");
      throw new Error("Image upload failed");
    }
  };

  const saveImageUrlToDatabase = async (imageUrl, index) => {
    const storyId = "your_story_id";
    const pageData = {
      page: index + 1,
      image: imageUrl,
      storyId: storyId,
    };

    console.time("Database API Call");
    try {
      console.log("Sending image data to the database...");
      const response = await axios.post(`${API_URL}/stories`, pageData);
      if (response.status === 201) {
        console.log("Image URL saved successfully:", response.data);
      } else {
        console.error("Database responded with an error:", response);
      }
      console.timeEnd("Database API Call");
    } catch (error) {
      console.error("Error during database save:", error);
      console.timeEnd("Database API Call");
      throw new Error("Database save failed");
    }
  };

  const addPage = () => {
    const currentPage = pages[pages.length - 1];
    if (!currentPage.text.trim()) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        pages: `Page ${currentPage.page} needs text.`,
      }));
      return;
    }

    if (pages.length < MAX_PAGES) {
      setPages((prevPages) => [
        ...prevPages,
        {
          page: prevPages.length + 1,
          text: "",
          image: null,
          audio: null,
          mediaUrl: "",
          // beeMessage: "🐝 Click me to narrate your magical tale!",
          // transcriptionStatus: "Idle",
          imageError: null,
          audioError: null,
          mediaUrlError: null,
          isPlaying: false, // Initialize playing state
          audioInstance: null, // Initialize audio instance
          isGenerating: false, // Initialize generating state
          newlyAdded: true,
        },
      ]);
    }

    if (pages.length + 1 === MAX_PAGES) {
      setLimitReached(true);
    }
  };

  const deletePage = async (indexToDelete) => {
    try {
      // Ensure the page exists
      const pageToDelete = pages[indexToDelete];
      if (!pageToDelete) {
        console.error("Page to delete does not exist.");
        return;
      }

      // Ensure the page has an ID
      const pageId = pageToDelete.id;
      if (!pageId) {
        console.warn(
          "Page does not have an ID. Cannot delete from the backend."
        );
        // Remove locally and reindex if no ID
        setPages((prevPages) =>
          prevPages
            .filter((_, index) => index !== indexToDelete)
            .map((page, index) => ({
              ...page,
              page: index + 1,
            }))
        );
        return;
      }

      // Send DELETE request to backend
      console.log(`Attempting to delete page with ID: ${pageId}`);
      const response = await axios.delete(`${API_URL}/stories/${pageId}`);
      if (response.status === 200) {
        console.log("Page deleted successfully.");

        // Update local state after successful deletion
        setPages((prevPages) =>
          prevPages
            .filter((_, index) => index !== indexToDelete)
            .map((page, index) => ({
              ...page,
              page: index + 1, // Reindex pages
            }))
        );
      } else {
        console.error(`Failed to delete the page. Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting page:", error);
    }
  };

  const handlePageTextChange = (value, index) => {
    if (!value) value = ""; // Ensure value is always a string
    const updatedPages = pages.map((page, i) =>
      i === index ? { ...page, text: value } : page
    );

    updatePages(updatedPages);

    if (value.length > CHARACTER_LIMIT) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        pages: `Page ${
          index + 1
        } exceeds the character limit of ${CHARACTER_LIMIT} characters. Extra text has been trimmed.`,
      }));
    } else if (value.trim()) {
      // Clear errors for this page if within the limit and text exists
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors.pages;
        return updatedErrors;
      });
    }
  };
  const handleFileUpload = async (e, index, type) => {
    const file = e.target.files[0];
    if (!file) {
      // Handle case where no file is selected
      if (type === "image") {
        if (index === null) {
          setFrontCover("");
          setErrors((prevErrors) => ({
            ...prevErrors,
            frontCover: "Cover required!",
          }));
        } else {
          setPages((prevPages) =>
            prevPages.map((page, i) =>
              i === index ? { ...page, image: null, imageError: null } : page
            )
          );
        }
      } else if (type === "audio") {
        setPages((prevPages) =>
          prevPages.map((page, i) =>
            i === index ? { ...page, audio: null, audioError: null } : page
          )
        );
      }
      return;
    }

    const uploadAudioToCloudinary = async (audioFile) => {
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("upload_preset", "your_upload_preset"); // Replace with your Cloudinary upload preset

      try {
        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/your_cloud_name/video/upload",
          formData
        );
        return response.data.secure_url; // Return the URL of the uploaded audio
      } catch (error) {
        console.error("Error uploading audio:", error);
        throw new Error("Audio upload failed");
      }
    };
    const validImageExtensions = /\.(jpg|jpeg|png|gif|webp)$/i; // Only image formats
    const validAudioExtensions = /\.(mp3|mp4|wav|ogg)$/i; // Audio formats including mp4

    // Check for image file type
    if (type === "image") {
      if (!validImageExtensions.test(file.name)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          frontCover:
            "Invalid file type. Supported formats: .jpg, .jpeg, .png, .gif, .webp.",
        }));
        prevPages.map(
          (page, i) =>
            i === index
              ? {
                  ...page,
                  image: null, // Clear the image
                  imageError:
                    "Invalid file type. Supported formats: .jpg, .jpeg, .png, .gif, .webp.",
                }
              : page // Correctly return 'page' for other indices
        );
        return; // Exit the function to prevent further processing
      }
    }

    // Check for audio file type
    if (type === "audio") {
      if (!validAudioExtensions.test(file.name)) {
        setPages((prevPages) =>
          prevPages.map((page, i) =>
            i === index
              ? {
                  ...page,
                  audio: null,
                  audioError:
                    "Invalid file type. Supported formats: .mp3, .mp4, .wav, .ogg.",
                }
              : page
          )
        );
        return; // Exit the function to prevent further processing
      }
    }

    // Proceed with file upload if the file type is valid
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "StoryEchoes");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dhxwg8gcz/upload",
        formData
      );

      if (response.data.secure_url) {
        const uploadedUrl = response.data.secure_url;

        if (type === "image") {
          if (index === null) {
            setFrontCover(uploadedUrl);
            setErrors((prevErrors) => {
              const updatedErrors = { ...prevErrors };
              delete updatedErrors.frontCover;
              return updatedErrors;
            });
          } else {
            setPages((prevPages) =>
              prevPages.map((page, i) =>
                i === index
                  ? { ...page, image: uploadedUrl, imageError: null }
                  : page
              )
            );
          }
        } else if (type === "audio") {
          setPages((prevPages) =>
            prevPages.map((page, i) =>
              i === index
                ? { ...page, audio: uploadedUrl, audioError: null }
                : page
            )
          );
        }
      }
    } catch (error) {
      console.error("File upload failed:", error);
      alert("An error occurred while uploading. Please try again.");
    }
  };

  const handleMediaUrlInput = (e, index) => {
    const url = e.target.value.trim(); // Get the value from the event object
    if (!url) {
      setPages((prevPages) =>
        prevPages.map((page, i) =>
          i === index ? { ...page, mediaUrl: "", mediaUrlError: null } : page
        )
      );
      return;
    }

    const validAudioExtensions = /\.(mp3|mp4|wav|ogg)$/i; // Updated to include mp4
    if (!validAudioExtensions.test(url)) {
      setPages((prevPages) =>
        prevPages.map(
          (page, i) =>
            i === index
              ? {
                  ...page,
                  mediaUrl: "", // Clear the media URL
                  mediaUrlError:
                    "Invalid audio URL. Supported formats: .mp3, .mp4, .wav, .ogg.",
                }
              : page // Return the unchanged page for other indices
        )
      );
      return; // Exit the function to prevent further processing
    }

    setPages((prevPages) =>
      prevPages.map((page, i) =>
        i === index ? { ...page, mediaUrl: url, mediaUrlError: null } : page
      )
    );
  };

  //Scroll for general page message.
  useEffect(() => {
    if (generalErrorMessage) {
      const errorMessageContainer = document.querySelector(
        ".general-error-message"
      );
      if (errorMessageContainer) {
        errorMessageContainer.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [generalErrorMessage]);

  const validate = () => {
    const newErrors = {};

    // Validate title
    if (!title.trim()) {
      newErrors.title = "Every story needs a title! ✨";
    }

    // Validate author
    if (!author.trim()) {
      newErrors.author = "Who is the storyteller? Add your name! 📖";
    }

    // Validate front cover
    if (!frontCover.trim()) {
      newErrors.frontCover = "Your story needs a cover! Add an image.";
    }

    // Validate all pages
    const emptyPages = pages
      .map((page, index) => ({
        pageNumber: index + 1,
        hasText: page.text.trim() !== "",
      }))
      .filter((page) => !page.hasText); // Filter out pages without text

    // General error message for multiple empty pages
    if (emptyPages.length > 1) {
      const pageNumbers = emptyPages.map((p) => p.pageNumber).join(", ");
      setGeneralErrorMessage(`The following pages need text: ${pageNumbers}.`); // General message
    } else {
      setGeneralErrorMessage(""); // Clear general message if fewer than 2 empty pages
    }

    // Specific error message for a single empty page
    if (emptyPages.length === 1) {
      newErrors.pages = `Page ${emptyPages[0].pageNumber} needs text.`; // Specific page error
    }

    // Add a combined general error message to newErrors if multiple pages are empty
    if (emptyPages.length > 0) {
      newErrors.general =
        "Some pages are missing content. Please review all pages to ensure they have text.";
    }

    // Validate media or image for each page
    pages.forEach((page, index) => {
      if (!page.mediaUrl?.trim() && !page.image) {
        newErrors[`page${index + 1}`] = `Page ${
          index + 1
        } requires either an image or a media URL.`;
      }
    });

    // Validate character limit
    const CHARACTER_LIMIT = 300; // Define your character limit
    const limitExceededPages = pages.filter(
      (page) => page.text.length > CHARACTER_LIMIT
    );

    if (limitExceededPages.length > 0) {
      const pageNumbers = limitExceededPages
        .map((_, index) => index + 1)
        .join(", ");
      newErrors.characterLimit = `The following pages exceed the character limit of ${CHARACTER_LIMIT} characters: ${pageNumbers}.`;
    }

    // Log errors and prevent submission if errors exist
    if (Object.keys(newErrors).length > 0) {
      console.error("Validation failed with the following errors:", newErrors);
    }

    setErrors(newErrors);

    // Return false if there are any errors
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate and ensure submission stops if errors exist
    if (!validate()) {
      console.error("Submission blocked due to validation errors.");
      return;
    }

    if (generalErrorMessage) {
      console.error("Cannot submit: unresolved errors exist.");
      return; // Stop submission if general errors exist
    }

    // Prepare the story object for submission
    const story = {
      title,
      author,
      front_cover: frontCover || FallbackImage,
      content: pages.map((page) => ({
        ...page,
        image: page.image || FallbackImage,
        audio: page.audio || null, // Include audio if present
        mediaUrl: page.mediaUrl || null,
      })),
    };

    try {
      // POST request to save the story
      const response = await fetch(`${API_URL}/stories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(story),
      });

      if (response.ok) {
        const responseData = await response.json();

        // Set success message and navigate to the story read page
        setBeeSubmitMessage(
          "🐝 Hooray! Your story has been submitted successfully!"
        );
        setIsStoryAdded(true);

        setTimeout(() => {
          navigate(`/read-story/${responseData.id}`);
        }, 2000);
      } else {
        // Handle server errors
        console.error("Failed to submit story. Server returned an error.");
        alert("Failed to submit your story. Please try again.");
      }
    } catch (error) {
      // Handle network or other errors
      console.error("Error submitting story:", error);
      alert("Error submitting story. Please try again.");
    }
  };

  // Function to toggle audio play/pause
  const toggleAudio = (index) => {
    const updatedPages = [...pages];
    const page = updatedPages[index];

    if (page.audioInstance) {
      // If audio is already playing, pause it
      page.audioInstance.pause();
      page.audioInstance = null; // Reset audio instance
    } else {
      // Create a new audio instance and play it
      const audio = new Audio(page.mediaUrl);
      audio.play();
      updatedPages[index].audioInstance = audio; // Store the audio instance
    }

    // Update the playing state
    updatedPages[index] = { ...page, isPlaying: !page.isPlaying };
    setPages(updatedPages);
  };

  return (
    <div
      className="add-story-container"
      style={{ fontFamily: "Comic Neuve, cursive" }}
    >
      <h1
        style={{
          fontFamily: "Comic Neuve, cursive",
          fontWeight: "bold",
          fontSize: "2rem",
        }}
      >
        Create Your Magical Adventure
      </h1>
      <form className="story-form">
        {/* Title and Author */}
        <div className="row">
          <div
            className={`form-group ${errors.title ? "error-highlight" : ""}`}
          >
            <label
              style={{
                fontFamily: "Comic Neuve, cursive",
                fontWeight: "bold",
                fontSize: "1.5rem",
              }}
            >
              Title
            </label>
            <input
              type="text"
              value={title}
              placeholder="Enter your story's title"
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) {
                  setErrors((prevErrors) => {
                    const updatedErrors = { ...prevErrors };
                    delete updatedErrors.title;
                    return updatedErrors;
                  });
                }
              }}
              style={{ fontFamily: "Comic Neuve, cursive" }}
            />
            {errors.title && (
              <span
                className="error"
                style={{ fontFamily: "Comic Neuve, cursive" }}
              >
                {errors.title}
              </span>
            )}
          </div>

          <div
            className={`form-group ${errors.author ? "error-highlight" : ""}`}
          >
            <label
              style={{
                fontFamily: "Comic Neuve, cursive",
                fontWeight: "bold",
                fontSize: "1.5rem",
              }}
            >
              Author
            </label>
            <input
              type="text"
              value={author}
              placeholder="Enter author's name"
              onChange={(e) => {
                setAuthor(e.target.value);
                if (e.target.value.trim()) {
                  setErrors((prevErrors) => {
                    const updatedErrors = { ...prevErrors };
                    delete updatedErrors.author;
                    return updatedErrors;
                  });
                }
              }}
              style={{ fontFamily: "Comic Neuve, cursive" }}
            />
            {errors.author && (
              <span
                className="error"
                style={{ fontFamily: "Comic Neuve, cursive" }}
              >
                {errors.author}
              </span>
            )}
          </div>
        </div>

        {/* Front Cover */}
        <div
          className={`form-group front-cover-group ${
            errors.frontCover ? "error-highlight" : ""
          }`}
        >
          <label
            style={{
              fontFamily: "Comic Neuve, cursive",
              fontWeight: "bold",
              fontSize: "1.5rem",
              marginLeft: "10px",
            }}
          >
            Front Cover
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, null, "image")}
            style={{ width: "300px" }}
          />
          {frontCover && (
            <img
              src={frontCover}
              alt="Front Cover"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                marginRight: "-750px",
                marginTop: "-100px",
                marginLeft: "-300px",
              }}
            />
          )}
          {errors.frontCover && (
            <span
              className="error"
              style={{
                fontFamily: "Comic Neuve, cursive",
                fontWeight: "bold",
                fontSize: "1.1rem",
              }}
            >
              {errors.frontCover}
            </span>
          )}
        </div>

        {/* Story Content Label */}
        <h2
          style={{
            color: "#28c4ac",
            textAlign: "center",
            margin: "20px 0",
            fontWeight: "bold",
            fontSize: "1.5rem",
          }}
        >
          Story Content
        </h2>

        {/* Pages Section */}
        <div
          ref={pagesContainerRef}
          className="pages-container"
          style={{
            overflowY: "scroll",
            overflowX: "hidden",
            maxHeight: "400px",
          }}
        >
          {pages.map((page, index) => (
            <div key={index} className="page-input-group">
              {/* Page Number Below the Thick Line */}

              {page.page > 1 ? (
                <h3
                  style={{
                    fontFamily: "Bubblegum Sans",
                    marginTop: "0",
                    marginBottom: "-70px",
                  }}
                >
                  Page {page.page}
                </h3>
              ) : (
                <h3 style={{ fontFamily: "Bubblegum Sans", marginTop: "0" }}>
                  Page {page.page}
                </h3>
              )}

              {/* Render the thick dark line only if the page number is greater than 1 */}
              {page.page > 1 && (
                <div
                  style={{
                    width: "800%",
                    height: "30px",
                    backgroundColor: "darkblue",
                    marginBottom: "30px",
                    marginLeft: "-15px",
                  }}
                ></div>
              )}

              {pages.map((page, index) => (
                <div
                  key={index}
                  className={`page ${
                    errors.pages?.includes(`Page ${page.page}`)
                      ? "error-highlight"
                      : ""
                  }`}
                ></div>
              ))}

              {/* Honey Bee Transcription */}
              <div
                onClick={() =>
                  alert(`Transcription clicked for Page ${page.page}`)
                }
                style={{
                  cursor: "pointer",
                  fontSize: "1rem",
                  textAlign: "center",
                }}
              >
                {page.beeMessage}
                <br />
                {/* Status: {page.transcriptionStatus} */}
              </div>

              {/* Text Area */}
              <textarea
                value={page.text}
                placeholder="Write your story here..."
                onChange={(e) => handlePageTextChange(e.target.value, index)}
                style={{
                  fontFamily: "Bubblegum Sans, cursive",
                  height: "150px",
                  marginBottom: "10px",
                }}
              />
              {errors.pages &&
                index + 1 === parseInt(errors.pages.match(/\d+/)?.[0]) && (
                  <span
                    className="error"
                    style={{ fontFamily: "Comic Neuve, cursive" }}
                  >
                    {errors.pages}
                  </span>
                )}

              {/* File Upload for Image */}
              <input
                type="file"
                accept="image/*"
                ref={(el) => (fileInputRefs.current[index] = el)} // Assign ref to the input
                onChange={(e) => handleFileUpload(e, index, "image")}
                style={{ width: "270px", marginRight: "360px" }}
              />
              {page.image && (
                <img
                  src={page.image}
                  alt={`Page ${page.page}`}
                  style={{
                    width: "180px", // Adjust the width of the input field
                    fontSize: "14px",
                    padding: "1px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    marginLeft: "150px",
                    marginTop: "-70px",
                  }}
                />
              )}
              {page.imageError && (
                <span
                  className="error"
                  style={{
                    fontFamily: "Comic Neuve, cursive",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                  }}
                >
                  {page.imageError}
                </span>
              )}

              {/* Media URL */}
              <input
                type="text"
                placeholder="Paste media URL"
                value={page.mediaUrl || ""}
                onChange={(e) => handleMediaUrlInput(e, index)}
                onBlur={(e) => handleMediaUrlInput(e, index)}
                style={{
                  fontFamily: "Bubblegum Sans, cursive",
                  marginTop: "10px",
                  width: "270px",
                  marginRight: "360px",
                }}
              />
              {page.mediaUrlError && (
                <span
                  className="error"
                  style={{ fontFamily: "Comic Neuve, cursive" }}
                >
                  {page.mediaUrlError}
                </span>
              )}

              {/* Play/Pause Button for Media URL */}
              {page.mediaUrl && !page.mediaUrlError && (
                <button
                  type="button"
                  onClick={() => toggleAudio(index)}
                  style={{
                    borderRadius: "30%",
                    width: "40px", // Smaller size
                    height: "40px", // Smaller size
                    backgroundColor: page.isPlaying ? "white" : "darkblue",
                    // backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    alignContent: "center",
                    marginLeft: "-10px",
                    position: "absolute",
                    // top: "50%",
                    // left: "50%",
                    transform: "translate(-700%, 40%)",
                  }}
                >
                  {page.isPlaying ? "⏸️" : "▶️"}
                </button>
              )}

              {page.text.trim() && (
                <div style={{ marginBottom: "20px" }}>
                  {" "}
                  {/* Parent wrapper */}
                  {/* Dynamically Render the Temporary Component */}
                  {temporaryComponent}
                  {/* Generate Image Button */}
                  <button
                    type="button"
                    onClick={() => handleImageGenerated(index, page.text)}
                    disabled={page.isGenerating} // Disable the button while generating
                    style={{
                      backgroundColor: page.isGenerating ? "white" : "darkblue",
                      color: "Magenta",
                      fontfamily: "Bubblegum San",
                      cursor: page.isGenerating ? "not-allowed" : "pointer",
                      padding: "10px 20px",
                      border: "none",
                      borderRadius: "5px",
                      fontWeight: "bold",
                      marginTop: "25px",
                    }}
                  >
                    {page.isGenerating ? "Generating..." : "Generate Image"}
                  </button>
                </div>
              )}
              <div
                className="page-buttons"
                style={{ display: "flex", gap: "10px" }}
              >
                {/* Add Page Button (only on the last page and if limit not reached) */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  {" "}
                </div>
                {index === pages.length - 1 && !limitReached && (
                  <button
                    type="button"
                    onClick={addPage}
                    style={{
                      fontFamily: "Bubblegum San",
                      fontSize: "small",
                      color: "Magenta",
                      backgroundColor: "darkblue",
                      fontWeight: "bold",
                      padding: "5px 5px", // Smaller padding
                      flex: "0.2", // Equal size
                      marginTop: page.page === 1 ? "20px" : "-30px", // Conditional margin
                    }}
                  >
                    + Add
                  </button>
                )}

                {/* Move Up Button */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => movePage(index, "up")}
                    style={{
                      fontFamily: "Comic Neuve, cursive",
                      fontSize: "small",
                      color: "darkblue",
                      backgroundColor: "lightgrey",
                      fontWeight: "bold",
                      position: "relative", // Ensure the button is positioned
                      top: "-15px", // Adjust the top position as needed
                    }}
                  >
                    ⬆️
                  </button>
                )}

                {/* Move Down Button */}
                {index < pages.length - 1 && (
                  <button
                    type="button"
                    onClick={() => movePage(index, "down")}
                    style={{
                      fontFamily: "Comic Neuve, cursive",
                      fontSize: "small",
                      color: "darkblue",
                      backgroundColor: "lightgrey",
                      fontWeight: "bold",
                      position: "relative", // Ensure the button is positioned
                      top: "-15px", // Adjust the top position as needed
                      left: "-130px", // Adjust the left position as needed
                    }}
                  >
                    ⬇️
                  </button>
                )}

                {/* Delete Button */}
                {pages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deletePage(index)}
                    style={{
                      fontFamily: "Bubblegum San",
                      fontSize: "0.9rem",
                      color: "Magenta",
                      backgroundColor: "darkblue",
                      fontWeight: "bold",
                      padding: "5px 5px", // Smaller padding
                      flex: "0.2", // Equal size
                      marginTop: "25px",
                      marginBottom: "50px",
                      marginRight: "100px",
                    }}
                  >
                    - Delete
                  </button>
                )}
              </div>
              {limitReached && (
                <div className="limit-message">
                  🎉 You’ve reached the maximum of 7 pages. Time to wrap up your
                  story! 🦄
                </div>
              )}
            </div>
          ))}
        </div>
        {/* General Error Message */}
        {generalErrorMessage && (
          <div
            style={{
              color: "Magenta",
              fontFamily: "Comic Neuve, cursive",
              fontSize: "20px",
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            {generalErrorMessage}
          </div>
        )}
        {/* Submit Button */}
        <div
          className="honey-bee-message"
          onClick={handleSubmit}
          style={{
            cursor: "pointer",
            fontFamily: "Comic Neuve, cursive",
            fontSize: "1.5rem", // Increased font size
            fontWeight: "bold", // Made bold
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          {beeSubmitMessage}
        </div>
      </form>
    </div>
  );
};

export default AddStory;
