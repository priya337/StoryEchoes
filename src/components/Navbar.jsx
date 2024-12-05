import "../styles/Navbar.css";
import Logo from "../assets/logo.png";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUsers } from "../contexts/user.context.jsx";
import SignIn from "./SignIn.jsx";
import SignInModal from "./SignInModal.jsx";

const Navbar = () => {
  const [modalShow, setModalShow] = useState(false);
  const { user } = useUsers();
  const navigate = useNavigate();

  function openStoryPics() {
    if (user) {
      navigate("/wonderShelf?mode=View");
    } else {
      setModalShow(true);
    }
  }

  return (
    <div className="navbar">
      <Link to="/">
        <div className="logo-area">
          <img src={Logo} alt="Story Echoes Logo" className="app-logo"></img>
          <span> Story Echoes</span>
        </div>
      </Link>

      <div className="menu-area">
        <SignIn></SignIn>
        <Link to="/wonderShelf?mode=Edit" className="menu-item">
          <span>Wonder Shelf</span>
        </Link>
        <div className="menu-item my-picks" onClick={openStoryPics}>
          <span>My Story Picks</span>
        </div>
        <Link to="/who-we-are" className="menu-item">
          <span>Who We Are</span>
        </Link>
      </div>
      <SignInModal show={modalShow} onHide={() => setModalShow(false)} />
    </div>
  );
};

export default Navbar;
