import { Link } from "react-router-dom";
import "../styles/Footer.css";
import githubLogo from "../assets/GitHub-logo.jpg";
import openIcon from "../assets/open.png";
import backgroundImage from "../assets/back.png";

const Footer = () => {
  return (
    <div
      className="footer"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <img src={githubLogo} alt="GitHub" className="github-logo" />
      <span className="open-link-icon-wrapper">
        <Link to="https://github.com/priya337/StoryEchoes.git">
          <img src={openIcon} alt="Open Icon" className="open-icon" />
        </Link>
      </span>
    </div>
  );
};

export default Footer;
