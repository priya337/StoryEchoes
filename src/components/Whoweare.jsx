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
