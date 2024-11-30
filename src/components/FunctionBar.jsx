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
      <button
        className="sort-button func-button"
        onClick={() => setAscSort(!ascSort)}
      >
        {ascSort ? "Z-A" : "A-Z"}
      </button>
      <button
        className="view-button func-button"
        onClick={() => setGridMode(!gridMode)}
      >
        {gridMode ? "List View" : "Grid View"}
      </button>
    </>
  );
};

export default FunctionBar;
