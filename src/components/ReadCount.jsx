import ReadIcon from "../assets/read.png";

const ReadCount = ({ story }) => {
  return (
    <div className="read-show">
      <img src={ReadIcon} alt="" className="read-icon" />
      <h3 className="bar-author">{story.readCount ? story.readCount : 0}</h3>
    </div>
  );
};

export default ReadCount;
