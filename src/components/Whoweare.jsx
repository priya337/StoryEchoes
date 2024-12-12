// Whoweare.jsx
import { Link } from "react-router-dom";
import "../styles/Whoweare.css"; // Import your CSS for styling

// Make sure the image files are imported
import Priya from "../assets/dinno.png"; // Import the profile image for Priya
import Neha from "../assets/dino.png"; // Import the profile image for Neha
import GitLogo from "../assets/GitHub-logo.jpg";
import LinkedInLogo from "../assets/LinkedInLogo.png";

function Whoweare() {
  return (
    <>
      <div className="about-main-content">
        <div className="about-container">
          <h2 className="about-site-title">Story Echoes... Echo your imagination, one story at a time.</h2>
          <h4 className="about-site-desc">Create, read, and explore stories like never before! This site lets kids craft their own books by doodling covers, adding images, 
            recording their voices, and even turning their stories into awesome AI art. Plus, if reading's tricky, they can listen to the book being narrated! 
            It’s a magical mix of creativity, tech, and fun!</h4>
          <h3>Meet the team!</h3>
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
                <li>
                  <Link to="https://github.com/priya337/">
                    <img
                      src={GitLogo}
                      alt="GitHub Logo"
                      className="profile-git"
                    />
                  </Link>
                  <Link to="https://linkedin.com/">
                    <img
                      src={LinkedInLogo}
                      alt="LinkedIn Logo"
                      className="profile-linked"
                    />
                  </Link>
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
                <li>
                  <Link to="https://github.com/nehais/">
                    <img
                      src={GitLogo}
                      alt="GitHub Logo"
                      className="profile-git"
                    />
                  </Link>
                  <Link to="https://linkedin.com/in/neha-builds">
                    <img
                      src={LinkedInLogo}
                      alt="LinkedIn Logo"
                      className="profile-linked"
                    />{" "}
                  </Link>
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
