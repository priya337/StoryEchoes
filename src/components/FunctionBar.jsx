import GridIcon from "../assets/grid.png";
import ListIcon from "../assets/list.png";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const FunctionBar = ({
  searchStr,
  setSearchStr,
  ascSort,
  setAscSort,
  gridMode,
  setGridMode,
}) => {
  return (
    <>
      <input
        type="text"
        placeholder="Search Story"
        className="search-bar"
        value={searchStr}
        onChange={(e) => setSearchStr(e.target.value)}
      />

      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="sort-tooltip">Sort the Stories on the Tiltle</Tooltip>}
      >
        <button className="func-button" onClick={() => setAscSort(!ascSort)}>
          {ascSort ? "Z-A" : "A-Z"}
        </button>
      </OverlayTrigger>

      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="list-tooltip">{gridMode ? "Change the view to List" : "Change the view to Grid"}</Tooltip>}
      >
        <button className="grid-view-button action-button" onClick={() => setGridMode(!gridMode)}>
          <img src={gridMode ? ListIcon : GridIcon} alt="Like Icon" />
        </button>
      </OverlayTrigger>
    </>
  );
};

export default FunctionBar;
