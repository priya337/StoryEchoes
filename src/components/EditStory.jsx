import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/EditStory.css";
import FallbackImage from "../assets/fallback.jpg";
import PollinationImage from "./PollinationImage"; // Import the PollinationImage component
import axios from "axios";
import { API_URL } from "../config/apiConfig.js";

const EditStory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pagesContainerRef = useRef(null);
  const [temporaryComponent, setTemporaryComponent] = useState(null);
  const [generalErrorMessage, setGeneralErrorMessage] = useState(); // State for error message
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [frontCover, setFrontCover] = useState("");
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
  const [errors, setErrors] = useState({});
  const [beeMessage, setBeeMessage] = useState(
    "🐝 Bzz... Click me & save your edited magical adventure. ✨"
  );
  const [limitReached, setLimitReached] = useState(false); // Track if max pages limit is reached
  const fileInputRefs = useRef([]); // Create a ref array for file inputs
  // State for tracking transcription statuses per page
  const [transcriptionStatuses, setTranscriptionStatuses] = useState({});
  const MAX_PAGES = 7;
  const CHARACTER_LIMIT = 300; // Define your character limit

  // Function to scroll to the first error field
  const scrollToError = () => {
    const firstErrorField = document.querySelector(".error-highlight");
    if (firstErrorField) {
      firstErrorField.scrollIntoView({
        behavior: "smooth", // Smooth scrolling
        block: "center", // Center the field vertically
      });
    }
  };

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

  useEffect(() => {
    if (generalErrorMessage && pagesContainerRef.current) {
      // Scroll to the bottom of the container when a general message is set
      pagesContainerRef.current.scrollTo({
        top: pagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [generalErrorMessage]);

  // Fetch the story details from the API
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setBeeMessage("🐝 Loading your story...");
        const response = await fetch(`${API_URL}/stories/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch story. Status: ${response.status}`);
        }
        const data = await response.json();

        setTitle(data.title || "Untitled Story");
        setAuthor(data.author || "Unknown Author");
        setFrontCover(data.front_cover || FallbackImage);
        setPages(data.content || []);
        if (data.content.length === MAX_PAGES) {
          setLimitReached(true);
        }

        // Initialize transcription statuses for each page as 'Idle'
        const initialStatuses = {};
        data.content.forEach((_, index) => {
          initialStatuses[index] = "Idle"; // Set initial status for each page as 'Idle'
        });
        setTranscriptionStatuses(initialStatuses);

        setBeeMessage(
          "🐝 Bzz... Click me & save your edited magical adventure. ✨"
        );
      } catch (error) {
        console.error("Error fetching story:", error);
        setBeeMessage("🐝 Oops! Couldn't load your story. Try again later.");
      }
    };

    if (id) {
      fetchStory();
    }
  }, [id]);

  // Update text for a specific page
  const handlePageTextChange = (value, index) => {
    const updatedPages = pages.map((page, i) =>
      i === index ? { ...page, text: value } : page
    );
    setPages(updatedPages);
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
        [`page-${index}-text`]: `Oops! Page ${
          index + 1
        } is missing content! Story Content cannot be empty! ✍️`,
      }));
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
            "Error! Supported formats: .jpg, .jpeg, .png, .gif, .webp.",
        }));
        prevPages.map(
          (page, i) =>
            i === index
              ? {
                  ...page,
                  image: null, // Clear the image
                  imageError:
                    "Error! Supported formats: .jpg, .jpeg, .png, .gif, .webp.",
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
                    "Invalid File. Supported formats: .mp3, .mp4, .wav, .ogg.",
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

  // Validate form before submission
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
    const limitExceededPages = pages.filter(
      (page) => page.text.length > CHARACTER_LIMIT
    );
    if (limitExceededPages.length > 0) {
      const pageNumbers = limitExceededPages
        .map((_, index) => index + 1)
        .join(", ");
      newErrors.characterLimit = `The following pages exceed the character limit of ${CHARACTER_LIMIT} characters:
${pageNumbers}.`;
    }

    // Log errors and prevent submission if errors exist
    if (Object.keys(newErrors).length > 0) {
      console.error("Validation failed with the following errors:", newErrors);
    }

    setErrors(newErrors);

    // Return false if there are any errors
    return Object.keys(newErrors).length === 0;
  };

  // Add a new page
  const addPage = () => {
    if (pages.length === 1 && !pages[0].text.trim()) {
      setErrors({
        ...errors,
        pages:
          "Oops! Please fill in the content for Page 1 before adding a new page.",
      });
      scrollToError();
      return;
    }

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

      const movePage = (pageIndex, direction) => {
        setPages((prevPages) => {
          const targetIndex =
            direction === "up" ? pageIndex - 1 : pageIndex + 1;

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

      // Send DELETE request to backend
      console.log(`Attempting to delete page with ID: ${pageId}`);
      const response = await axios.delete(`${API_URL}/stories/${pageId}`);
      if (response.status === 200) {
        console.log("Page deleted successfully.");
        setLimitReached(false);

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

  // Front Cover Change Handler
  const handleFrontCoverChange = (e) => {
    const value = e.target.value;
    setFrontCover(value);

    // Validate URL
    const isValidURL = (url) => {
      const regex =
        /^(https?:\/\/.*\.(?:jpg|jpeg|png|gif|bmp|svg|webp))$|^(.*\.(?:jpg|jpeg|png|gif|bmp|svg|webp))$/i;
      if (!regex.test(url)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          frontCover:
            "Oops! Please enter a valid image URL for the front cover. 🖼️",
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
      setBeeMessage("🐝 Saving your edits...");
      const response = await fetch(`${API_URL}/stories/${id}`, {
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
    <div>
      <h1 className="add-story-header">Weave in your edited Magical Story</h1>
      <div className="story-container">
        <form
          className="story-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* Title and Author */}
          <div className="row">
            <div
              id="title"
              className={`form-group ${
                errors.title
                  ? "error-highlight"
                  : title.trim()
                  ? "success-highlight"
                  : ""
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
                errors.author
                  ? "error-highlight"
                  : author.trim()
                  ? "success-highlight"
                  : ""
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

          {/* Front Cover Area*/}
          <div
            className="row"
            style={{
              justifyContent: "space-between",
            }}
          >
            {/* Select Front Cover pic*/}
            <div
              style={{
                width: "40%",
                display: "flex",
                justifyContent: "space-between",
                padding: "0px",
                alignItems: "center",
              }}
            >
              <div
                id="frontCover"
                className={`form-group front-cover-group ${
                  errors.frontCover
                    ? "error-highlight"
                    : frontCover.trim() && !errors.frontCover
                    ? "success-highlight"
                    : ""
                } ${errors.frontCover ? "error-highlight" : ""}`}
              >
                <label>Front Cover</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, null, "image")}
                  style={{
                    width: "100%",
                    marginBottom: "0px",
                    fontFamily: "Comic Neuve, cursive",
                  }}
                />
                {errors.frontCover && (
                  <span className="error">{errors.frontCover}</span>
                )}
              </div>

              {/*Doodle Button Place holder*/}
              <div
                style={{
                  width: "20%",
                  padding: "30px 0 0 10px",
                }}
              >
                <button
                  style={{
                    height: "35px",
                  }}
                >
                  DOODLE
                </button>
              </div>
            </div>

            <div
              className="front-cover-img"
              style={{
                paddingLeft: "20px",
              }}
            >
              {frontCover && (
                <img
                  src={frontCover}
                  alt="Front Cover"
                  style={{
                    width: "80px",
                    maxHeight: "80px",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
              )}
            </div>
          </div>

          <div className="row">
            <div className="form-group">
              {/* Story Content Label */}
              <label>Story Content</label>
            </div>
          </div>

          {/* Pages Section */}
          <div ref={pagesContainerRef} className="pages-container">
            {pages.map((page, index) => (
              <div key={index} className="page-input-group">
                <div
                  style={{
                    textAlign: "center",
                    fontFamily: "'Bubblegum Sans', cursive",
                  }}
                >
                  {/* <div className="honey-bee-transcription" onClick={()=> handleStartTranscription(index)}
                    style={{ cursor: "pointer", fontSize: "1rem" }}
                    >
                    <p>🐝 Bzz... Click me to weave your magical tale. ✨</p>
                  </div> */}
                  {/* <div className="transcription-status" style={{
                    fontWeight: "bold",
                    color: transcriptionStatuses[index] === "Idle" ? "magenta" : "blue",
                    fontSize: "1rem",
                  }}>
                    Status: {transcriptionStatuses[index] || "Idle"}
                  </div> */}
                </div>
                {page.page > 1 ? (
                  <h3>--------- Page {page.page} ---------</h3>
                ) : (
                  <h3 style={{ fontFamily: "Bubblegum Sans", marginTop: "0" }}>
                    --------- Page {page.page} ---------
                  </h3>
                )}

                {/* page.page > 1 && (
                  <div
                    style={{
                      width: "104%",
                      height: "30px",
                      backgroundColor: "darkblue",
                      marginBottom: "30px",
                      marginLeft: "-10px",
                    }}
                  ></div>
                )*/}

                {/* Text Area */}
                <div style={{ display: "flex", marginBottom: "10px" }}>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                    }}
                  >
                    <textarea
                      value={page.text}
                      placeholder="Write your story here..."
                      onChange={(e) =>
                        handlePageTextChange(e.target.value, index)
                      }
                      style={{
                        fontFamily: "Bubblegum Sans, cursive",
                        height: "80px",
                      }}
                    />
                    {errors.pages &&
                      index + 1 ===
                        parseInt(errors.pages.match(/\d+/)?.[0]) && (
                        <span className="error">{errors.pages}</span>
                      )}
                  </div>

                  {/* Display image next to the Text*/}
                  <div>
                    {page.image && (
                      <img
                        src={page.image}
                        alt={`Page ${page.page}`}
                        style={{
                          width: "80px", // Adjust the width of the input field
                          height: "80px",
                          border: "1px solid #ccc",
                          borderRadius: "10px",
                        }}
                      />
                    )}

                    {/* Dynamically Render the Temporary Component */}
                    {!page.image && temporaryComponent}

                    {page.imageError && (
                      <span
                        className="error"
                        style={{
                          fontFamily: "Comic Neuve, cursive",
                          fontWeight: "bold",
                          fontSize: "1rem",
                        }}
                      >
                        {page.imageError}
                      </span>
                    )}
                  </div>
                </div>

                {/* Image Button Area */}
                <div className="page-image-buttons">
                  {/* File Upload for Image */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={(el) => (fileInputRefs.current[index] = el)} // Assign ref to the input
                    onChange={(e) => handleFileUpload(e, index, "image")}
                    style={{ width: "50%", maxHeight: "37px" }}
                  />

                  {page.text.trim() && (
                    <div>
                      {" "}
                      {/* Parent wrapper */}
                      {/* Generate Image Button */}
                      <button
                        type="button"
                        onClick={() => handleImageGenerated(index, page.text)}
                        disabled={page.isGenerating} // Disable the button while generating
                        style={{
                          backgroundColor: page.isGenerating
                            ? "white"
                            : "darkblue",
                          color: "Magenta",
                          fontfamily: "Bubblegum San",
                          fontWeight: "bold",
                          cursor: page.isGenerating ? "not-allowed" : "pointer",
                          border: "none",
                          borderRadius: "5px",
                          height: "35px",
                          fontSize: "0.8em",
                        }}
                      >
                        {page.isGenerating ? "Generating..." : "Generate Image"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Media Area */}
                <div className="page-media-buttons">
                  <div
                    style={{
                      width: "50%",
                    }}
                  >
                    {/* Media URL */}
                    <div>
                      <input
                        type="text"
                        placeholder="Paste media URL"
                        value={page.mediaUrl || ""}
                        onChange={(e) => handleMediaUrlInput(e, index)}
                        onBlur={(e) => handleMediaUrlInput(e, index)}
                        style={{
                          fontFamily: "Bubblegum Sans, cursive",
                          width: "100%",
                        }}
                      />
                      {page.mediaUrlError && (
                        <span
                          className="error"
                          style={{
                            fontFamily: "Comic Neuve, cursive",
                            paddingLeft: "10px",
                            fontSize: "0.75em",
                          }}
                        >
                          {page.mediaUrlError}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      alignSelf: "flex-start",
                    }}
                  >
                    {/* Play/Pause Button for Media URL */}
                    {page.mediaUrl && !page.mediaUrlError && (
                      <button
                        type="button"
                        onClick={() => toggleAudio(index)}
                        style={{
                          backgroundColor: "transparent",
                          padding: "5px 0 0 10px",
                          border: "none",
                        }}
                      >
                        {page.isPlaying ? "⏸️" : "▶️"}
                      </button>
                    )}
                  </div>
                </div>

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

                  <div
                    style={{
                      width: "33%",
                      display: "flex",
                      justifyContent: "flex-start",
                    }}
                  >
                    {index === pages.length - 1 && !limitReached && (
                      <button
                        type="button"
                        onClick={addPage}
                        style={{
                          fontFamily: "Bubblegum San",
                          color: "Magenta",
                          backgroundColor: "darkblue",
                          fontWeight: "bold",
                          border: "none",
                          borderRadius: "5px",
                          height: "35px",
                          fontSize: "0.8em",
                        }}
                      >
                        + Add
                      </button>
                    )}
                  </div>

                  {/* Move Up Button */}
                  <div className="move-buttons">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => movePage(index, "up")}
                        style={{
                          backgroundColor: "transparent",
                          padding: "0px",
                          border: "none",
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
                          backgroundColor: "transparent",
                          padding: "0px",
                          border: "none",
                        }}
                      >
                        ⬇️
                      </button>
                    )}
                  </div>

                  {/* Delete Button */}
                  <div
                    style={{
                      width: "33%",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    {pages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deletePage(index)}
                        style={{
                          fontFamily: "Bubblegum San",
                          color: "Magenta",
                          backgroundColor: "darkblue",
                          fontWeight: "bold",
                          border: "none",
                          borderRadius: "5px",
                          height: "35px",
                          fontSize: "0.8em",
                        }}
                      >
                        - Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {limitReached && (
              <div className="limit-message">
                🎉 You’ve reached the maximum of 7 pages. Time to wrap up your
                story! 🦄
              </div>
            )}
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
              fontSize: "1em", // Increased font size
              textAlign: "center",
              marginTop: "10px",
              borderRadius: "10px",
              backgroundColor: "darkblue",

              border: "2px solid #28c4ac",
              padding: "2px 5px",
            }}
          >
            {beeMessage}
          </div>
        </form>
      </div>
    </div>
  );
};
export default EditStory;
