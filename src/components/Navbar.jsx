import "../styles/Navbar.css";
import Logo from "../assets/logo.png";

import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="navbar">
      <Link to="/">
        <div className="logo-area">
          <img src={Logo} alt="Story Echoes Logo" className="app-logo"></img>
          <span> Story Echoes</span>
        </div>
      </Link>

      <div className="menu-area">
        <Link to="/wonderShelf?mode=Edit" className="menu-item">
          <span>Wonder Shelf</span>
        </Link>
        <Link to="/wonderShelf?mode=View" className="menu-item">
          <span>My Story Picks</span>
        </Link>
        <Link to="/who-we-are" className="menu-item">
          <span>Who We Are</span>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
