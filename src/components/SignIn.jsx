import { useState } from "react";
import SignInModal from "./SignInModal.jsx";
import { useUsers } from "../contexts/user.context.jsx";

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const LikeButton = ({}) => {
  const [modalShow, setModalShow] = useState(false);
  const { user } = useUsers();

  return (
    <div className="login-area">
      {user && <h6>{user ? `Hi ${user}!` : ""}</h6>}
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id="like-tooltip">Sign in for Personalized Picks</Tooltip>
        }
      >
        <button
          className={user ? "signedin-button" : "signin-button"}
          onClick={() => setModalShow(true)}
        >
          {user ? "Switch User" : "Sign In"}
        </button>
      </OverlayTrigger>

      <SignInModal show={modalShow} onHide={() => setModalShow(false)} />
    </div>
  );
};

export default LikeButton;
