import "../styles/ReadStory.css";
import lamp from "../assets/lamp.png";

import { useState, useEffect, useRef, forwardRef } from "react";
import { useParams, Link } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";

import axios from "axios";

const PageCover = forwardRef((props, ref) => {
  return (
    <div className="page page-cover" ref={ref} data-density="hard">
      <div className="page-content">
        <h2 className="cover-page-title">{props.children}</h2>
        <img src={props.cover} alt="Front Cover" className="cover-page-image" />
      </div>
    </div>
  );
});

const Page = forwardRef((props, ref) => {
  return (
    <div className="page" ref={ref}>
      <div className="page-content">
        <div className="page-image">
          <img src={props.image} alt="Page Image" />
        </div>
        <div className="page-text">{props.children}</div>
        <div className="page-footer">{props.number + 1}</div>
      </div>
    </div>
  );
});

const ReadStory = () => {
  const { id } = useParams(); // Get the story ID from the route
  const [story, setStory] = useState(null); // State to store story data
  const [page, setPage] = useState(0); // State to store page no
  const [totalPage, setTotalPage] = useState(0); // State to total page nos
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling

  const flipBook = useRef({});

  useEffect(() => {
    // Fetch story data
    const fetchStory = async () => {
      try {
        const { data } = await axios.get(`http://localhost:9001/stories/${id}`);
        setStory(data);
      } catch (err) {
        console.error("Error fetching story:", err);
        setError("Failed to load the story.");
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  const onPageFlip = (e) => {
    setPage(e.data);
  };

  return (
    <div className="reading-area">
      {/* Lamp and glow 
      <img src={lamp} alt="Lamp" className="lamp" />
      maxShadowOpacity={0.5}
      mobileScrollSupport={true}
                  
      <div className="bulb glow"></div>*/}
      {!loading && !error && story && (
        <div className="book-container">
          <Link to={`/editStory/${id}`}>
            <button>EDIT</button>
          </Link>
          <HTMLFlipBook
            width={350}
            height={400}
            size="stretch"
            minWidth={350}
            maxWidth={700}
            minHeight={400}
            maxHeight={400}
            showCover={true}
            onFlip={onPageFlip}
            className="demo-book"
            ref={flipBook}
          >
            {/* Front cover */}
            <PageCover cover={story.front_cover}>{story.title}</PageCover>

            {/* Story content */}
            {story.content.map((storyPage) => {
              return (
                <Page
                  number={storyPage.page}
                  image={storyPage.image}
                  key={storyPage.page}
                >
                  {storyPage.text}
                </Page>
              );
            })}

            {/* End cover */}
            <PageCover cover={story.back_cover}>THE END</PageCover>
          </HTMLFlipBook>

          {/* Button to navigate the book */}
          <div className="page-nav-area">
            <div className="navigation-btn">
              <span className="arrow">🠘</span> {/* Arrow icon */}
            </div>
            <span className="page-nos">
              {1} : {story.content.length}
            </span>{" "}
            <div className="navigation-btn">
              <span className="arrow">🠚</span> {/* Arrow icon */}
            </div>
          </div>
        </div>
      )}

      {/* Loading and error messages */}
      {loading && <p>Loading story...</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ReadStory;
