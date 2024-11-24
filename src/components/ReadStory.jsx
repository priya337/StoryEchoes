import "../styles/ReadStory.css";
import lamp from "../assets/lamp.png";

const ReadStory = () => {
  return (
    <div className="reading-area">
        <img src={lamp} alt="Lamp" className="lamp"/>
        <div className='round glow'></div>
    </div>
  )
}

export default ReadStory