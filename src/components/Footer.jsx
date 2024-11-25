import React from 'react';
import '../styles/Footer.css'; 
import githubLogo from '../assets/GitHub-logo.jpg';
import backgroundImage from '../assets/background.jpg';

const Footer = () => {
  return (
    <div className="footer" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <a href="https://github.com/priya337/StoryEchoes.git" target="_blank" rel="noopener noreferrer">
        <img 
          src={githubLogo} 
          // alt="GitHub" 
          style={{ width: '60px', height: '50px' }} 
        />
      </a>
      <p>Check out my repository on GitHub!</p>
    </div>
  );
};

export default Footer;


