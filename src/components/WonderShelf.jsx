import "../styles/WonderShelf.css";
import Add from "../assets/plus.png";
import { Link } from "react-router-dom";

const WonderShelf = () => {
  return (
    <div>
      <Link to="/addStory">
        <img src={Add} alt="Add Story Logo" className="add-icon"></img>
      </Link>

      <Link to="/readStory">
        <h4>Read Story</h4>
      </Link>
    </div>
  );
};

export default WonderShelf;
