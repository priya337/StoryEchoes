import "../styles/ReadStory.css";
import Logo from "../assets/logo.png";

import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import Spinner from "react-bootstrap/Spinner";
import { useStories } from "../contexts/stories.context.jsx";

import api from "../api.js";
import ActionBar from "./ActionBar.jsx";

const ReadStory = () => {
  const { id } = useParams(); // Get the story ID from the route
  const { setRefresh } = useStories(); //Fetched stories in Context API

  const [story, setStory] = useState(null); // State to store story data
  const [page, setPage] = useState(0); // State to store page no
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling
  const [storyToSpeak, setStoryToSpeak] = useState(""); // Content to speak
  const [bookDimensions, setBookDimensions] = useState(null); // Portrait mode for Tablet Screen
  const flipBook = useRef({});

  useEffect(() => {
    //Change dimensions for Portrait mode in Tablet Screen
    const screenW = window.innerWidth;
    const bookW = screenW <= 768 && screenW >= 426 ? 400 : 350;
    const bookH = screenW <= 768 && screenW >= 426 ? 450 : 400;
    setBookDimensions({ bookW, bookH });
  }, []);

  useEffect(() => {
    // Fetch story data
    const fetchStory = async () => {
      try {
        const { data } = await api.get(`/stories/${id}`);
        setStory(data);
        setStoryToSpeak(
          data.title + (data.Author ? `. Echoed by ${data.Author}` : "")
        );
        updateStoryReadCount(data);
      } catch (err) {
        console.error("Error fetching story:", err);
        setError("Failed to load the story.");
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  function updateStoryReadCount(story) {
    //Call Update function & update the story read count
    story.readCount = story.readCount ? story.readCount + 1 : 1;

    api
      .put(`/stories/${story.id}`, story)
      .then(() => {
        //Indicate Context API for refresh
        setRefresh((prev) => prev + 1);
      })
      .catch((error) =>
        console.log("Error during story update Read Count:", error)
      );
  }

  const fetchContentToNarrate = (page) => {
    if (page === 0) {
      return story.title;
    } else {
      //Concatenate 2 pages text to be narrated
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
    const storyNarration = fetchContentToNarrate(e.data);
    setStoryToSpeak(storyNarration); //Set the narration text on page flip
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
  if (!bookDimensions || loading || !story) {
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
      <ActionBar
        story={story}
        storyToSpeak={storyToSpeak}
        page={page}
        mode={"Edit"}
      ></ActionBar>

      <div className="reading-area">
        {!error && story && (
          <div className="book-container">
            <HTMLFlipBook
              width={bookDimensions.bookW}
              height={bookDimensions.bookH}
              size="stretch"
              minWidth={bookDimensions.bookW}
              maxWidth={700}
              minHeight={400}
              maxHeight={450}
              showCover={true}
              maxShadowOpacity={0.5}
              mobileScrollSupport={true}
              flippingTime={300} // Faster flipping time
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
                  <h6 className="cover-page-author">
                    Echoed by {story.Author ? story.Author : "Anonymous"}
                  </h6>
                </div>
              </div>

              {/* Story content*/}
              {story.content.map((storyPage, index) => {
                return (
                  <div className="page" key={storyPage.page}>
                    <div className="page-content">
                      <div className="page-image-cont">
                        <img
                          src={storyPage.image}
                          alt={`Page ${index + 1} Image`}
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
              <div
                className="navigation-btn left-arrow"
                onClick={prevButtonClick}
              ></div>
              <span className="page-nos">
                {page} : {story.content.length}
              </span>{" "}
              <div
                className="navigation-btn right-arrow"
                onClick={nextButtonClick}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadStory;
