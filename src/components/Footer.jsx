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
      <Link to="https://github.com/priya337/StoryEchoes.git">
        <img src={githubLogo} alt="GitHub" className="github-logo" />
        <img src={openIcon} alt="Open Icon" className="open-icon" />
      </Link>
    </div>
  );
};

export default Footer;
