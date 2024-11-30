import GridIcon from "../assets/grid.png";
import ListIcon from "../assets/list.png";

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
      <button className="func-button" onClick={() => setAscSort(!ascSort)}>
        {ascSort ? "Z-A" : "A-Z"}
      </button>
      <div
        className="view-button"
        style={{
          backgroundImage: `url(${gridMode ? ListIcon : GridIcon})`,
        }}
        onClick={() => setGridMode(!gridMode)}
      ></div>
    </>
  );
};

export default FunctionBar;
