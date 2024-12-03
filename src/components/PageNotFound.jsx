import "../styles/PageNotFound.css";
import { Link } from "react-router-dom";
import pageNotFound from "../assets/page-not-found.png";

const PageNotFound = () => {
  return (
    <div className="notfound">
      <h3>
        Uh-ooooh!
        <br /> It looks like you’ve wandered off the story trail.
      </h3>
      <img src={pageNotFound} className="jungle-shine" />
      <Link to="/" id="back-home">
        Take me Home
      </Link>
    </div>
  );
};

export default PageNotFound;
