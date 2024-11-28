import "../styles/ReadStory.css";
import Logo from "../assets/logo.png";

import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import Spinner from "react-bootstrap/Spinner";

import axios from "axios";
import ActionBar from "./ActionBar";

const ReadStory = () => {
  const { id } = useParams(); // Get the story ID from the route

  const [story, setStory] = useState(null); // State to store story data
  const [page, setPage] = useState(0); // State to store page no
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling
  const [storyToSpeak, setStoryToSpeak] = useState(""); // Content to speak

  const flipBook = useRef({});

  useEffect(() => {
    // Fetch story data
    const fetchStory = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/stories/${id}`);
        setStory(data);
        setStoryToSpeak(data.title);
      } catch (err) {
        console.error("Error fetching story:", err);
        setError("Failed to load the story.");
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  const fetchContentToSpeak = (page) => {
    if (page === 0) {
      return story.title;
    } else {
      const storyNarration = story.content
        .slice(page - 1, page + 1)
        .reduce((a, b) => {
          return (a += " " + b.text);
        }, "");
      return storyNarration;
    }
  };

  const onPageFlip = (e) => {
    setPage(e.data);
    const storyNarration = fetchContentToSpeak(e.data);
    setStoryToSpeak(storyNarration);
  };

  const nextButtonClick = () => {
    flipBook.current.pageFlip().flipNext();
  };

  const prevButtonClick = () => {
    flipBook.current.pageFlip().flipPrev();
  };

  // Reset book to the front cover
  const resetBook = () => {
    if (flipBook.current) {
      flipBook.current.pageFlip().flip(0); // Flip to the first page
    } else {
      console.error("Error assigning Ref for flipBook.");
    }
  };

  /* Display loading indicator */
  if (loading) {
    return (
      <div className="message-area">
        <Spinner animation="grow" variant="info" />
        <p>Echoing your story...</p>
      </div>
    );
  }

  /* Display error */
  if (error) {
    return (
      <div className="message-area">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="read-container">
      <ActionBar story={story} storyToSpeak={storyToSpeak}></ActionBar>

      <div className="reading-area">
        {!error && story && (
          <div className="book-container">
            <HTMLFlipBook
              width={350}
              height={400}
              size="stretch"
              minWidth={350}
              maxWidth={700}
              minHeight={400}
              maxHeight={400}
              showCover={true}
              maxShadowOpacity={0.5}
              mobileScrollSupport={true}
              onFlip={onPageFlip}
              ref={flipBook}
            >
              {/* Front cover*/}
              <div className="page" data-density="hard">
                <div className="page-content">
                  <h2 className="cover-page-title">{story.title}</h2>
                  <img
                    src={story.front_cover}
                    alt="Front Cover"
                    className="cover-page-image"
                  />
                </div>
              </div>

              {/* Story content*/}
              {story.content.map((storyPage) => {
                return (
                  <div className="page" key={storyPage.page}>
                    <div className="page-content">
                      <div className="page-image-cont">
                        <img
                          src={storyPage.image}
                          alt="Page Image"
                          className="page-image"
                        />
                      </div>
                      <div className="page-text">{storyPage.text}</div>
                      <div className="page-footer">{storyPage.page}</div>
                    </div>
                  </div>
                );
              })}

              {/* End cover */}
              <div className="page end-page" data-density="hard">
                <div className="end-page-content" onClick={resetBook}>
                  <h3 className="end-page-title">THE END</h3>
                  <h4>🎉 Want to Relive the Magic? 🎉</h4>
                  <h4>
                    Click here to start the adventure again from the very
                    beginning!
                  </h4>

                  <img
                    src={Logo}
                    alt="Story Echoes Logo"
                    className="app-logo"
                  ></img>
                </div>
              </div>
            </HTMLFlipBook>

            {/* Button to navigate the book */}
            <div className="page-nav-area">
              <div className="navigation-btn" onClick={prevButtonClick}>
                <span className="arrow">🠘</span>
              </div>
              <span className="page-nos">
                {page} : {story.content.length}
              </span>{" "}
              <div className="navigation-btn" onClick={nextButtonClick}>
                <span className="arrow">🠚</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadStory;
