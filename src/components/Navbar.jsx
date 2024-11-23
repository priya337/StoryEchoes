import "../styles/Navbar.css";
import Logo from "../assets/logo.png";

import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="navbar">
      <img src={Logo} alt="Story Echoes Logo" className="app-logo"></img>
      <span> Story Echoes</span>
      <Link to="/wonderShelf">
        <span>Wonder Shelf</span>
      </Link>
    </div>
  );
};

export default Navbar;
