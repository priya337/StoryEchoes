import "../styles/Home.css";
import cover from "../assets/homepage-pic.jpg";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <Link to="wonderShelf">
      <div className="home">
        <h2 className="type-writer">
          Echo your imagination, one story at a time.
        </h2>
        <img
          src={cover}
          alt="Cover page picture"
          className="cover-logo shine"
        ></img>
      </div>
    </Link>
  );
};

export default Home;
