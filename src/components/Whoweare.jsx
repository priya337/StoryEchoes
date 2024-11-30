// Whoweare.jsx
import React from "react";
import "../styles/Whoweare.css"; // Import your CSS for styling

// Make sure the image files are imported
import Priya from "../assets/dinno.png";  // Import the profile image for Priya
import Neha from "../assets/dino.png";  // Import the profile image for Neha

function Whoweare() {
  return (
    <>
      <div className="about-main-content">
        <div className="about-container">
          <h1>Meet the team!</h1>
          <ul className="about-list-items">
            <li>
              <img src={Priya} alt="profile" className="profile-image" />
              <br />
              <span className="name">Priya</span>
              <ul className="additional-info">
                <li>
                  <strong>Role:</strong> Full-stack Developer
                </li>
                <li>
                  <strong>Country:</strong> The Netherlands
                </li>
              </ul>
            </li>
            <li>
              <img src={Neha} alt="profile" className="profile-image" />
              <br />
              <span className="name">Neha</span>
              <ul className="additional-info">
                <li>
                  <strong>Role:</strong> Full-stack Developer
                </li>
                <li>
                  <strong>Country:</strong> Germany
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default Whoweare;
