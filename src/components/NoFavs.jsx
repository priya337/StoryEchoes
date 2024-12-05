import EmptyBookShelfPic from "../assets/empty-bookshelf.png";

const NoFavs = () => {
  return (
    <div>
      {/*No Favourites*/}
      <h4 className="empty-fav-msg">
        Your bookshelf is looking a little lonely! <br />
        ❤️ Mark your favorite stories to bring it to life!
      </h4>
      <img src={EmptyBookShelfPic} alt="" className="empty-book-shelf-img" />
    </div>
  );
};

export default NoFavs;
