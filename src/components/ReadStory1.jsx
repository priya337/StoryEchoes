import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import "../styles/ReadStory.css";
import lampImage from "../assets/lamp.png";
import axios from "axios";

const ReadStory = () => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const flipBookRef = useRef(null); // Ref for the flipbook

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await axios.get(`http://localhost:400/stories/${id}`);
        setStory(response.data);
      } catch (err) {
        console.error("Error fetching story:", err);
        setError("Failed to load the story.");
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  // Reset book to the front cover
  const resetBook = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flip(0); // Flip to the first page
    } else {
      console.error("flipBookRef is not properly assigned.");
    }
  };

  if (loading) return <div>Loading story...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="reading-area">
      {/* Lamp and Glow */}
      <div className="lamp">
        <img src={lampImage} alt="Lamp" />
      </div>
      <div className="glow"></div>
      <div className="round"></div>

      {/* Book Logic */}
      <div className="book-container">
        <HTMLFlipBook
          ref={flipBookRef}
          width={350}
          height={500}
          size="stretch"
          minWidth={300}
          minHeight={450}
          maxWidth={700}
          maxHeight={1000}
          showCover={true}
          flippingTime={300} // Faster flipping time
        >
          {/* Front Cover */}
          <div className="page">
            <div className="page-content">
              <img src={story.front_cover} alt="Front Cover" />
            </div>
          </div>

          {/* Content Pages */}
          {story.content.map((page, index) => (
            <div className="page" key={index}>
              <div className="page-left">
                <p>{page.text}</p>
              </div>
              <div className="page-right">
                <img src={page.image} alt={`Page ${index + 1}`} />
              </div>
            </div>
          ))}

          {/* End of Story */}
          <div className="page" onClick={resetBook} style={{ cursor: "pointer" }}>
            <div className="page-content back-cover">
              <p>Click here and 
               Enjoy reading the story again! </p>
            </div>
          </div>
        </HTMLFlipBook>
      </div>
    </div>
  );
};

export default ReadStory;
