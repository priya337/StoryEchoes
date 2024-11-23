import "../styles/WonderShelf.css";
import Add from "../assets/plus.png";
import { Link } from "react-router-dom";

const WonderShelf = () => {
  return (
    <div>
      WonderShelf
      <Link to="/addStory">
        <img src={Add} alt="Add Story Logo"></img>
      </Link>
    </div>
  );
};

export default WonderShelf;
