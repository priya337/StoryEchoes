import React from 'react';
import '../styles/Footer.css'; 
import githubLogo from '../assets/GitHub-logo.jpg';
import backgroundImage from '../assets/back.png';

const Footer = () => {
  return (
    <div className="footer" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <a href="https://github.com/priya337/StoryEchoes.git" target="_blank" rel="noopener noreferrer" className="footer-link">
        <img 
          src={githubLogo} 
          alt="GitHub" 
          className="github-logo"
        />
      </a>
      <span className="open-link-icon-wrapper">
        <a href="https://github.com/priya337/StoryEchoes.git" target="_blank" rel="noopener noreferrer" className="open-link-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="20px"
            height="20px"
          >
            <path d="M13.5 10.5L19 5v4M19 5h-4m4 0v4m-8 8H5V5h4V3H3v18h18v-6h-2v4h-8z" />
          </svg>
        </a>
      </span>
    </div>
  );
};

export default Footer;
