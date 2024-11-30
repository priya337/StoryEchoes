import { Link } from "react-router-dom";

const EditDeleteButton = ({ story }) => {
  return (
    <div className="edit-del-buttons">
      {/*Edit Button*/}
      <Link to={`/editStory/${story.id}`}>
        <button className="edit-button action-button"></button>
      </Link>

      {/*Delete Button*/}
      <div className="delete-button action-button"></div>
    </div>
  );
};

export default EditDeleteButton;
