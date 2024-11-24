import "../styles/Home.css";
import cover from "../assets/homepage-pic.jpg";

const Home = () => {
  return (
  <div className="home">
    <h2>Echo your imagination, one story at a time.</h2>  
    <img src={cover} alt="Cover page picture" className="cover-logo shine"></img>
  </div>);
};

export default Home;
