import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useUsers } from "../contexts/user.context.jsx";

export default function SignInModal(props) {
  const [userName, setUserName] = useState("");
  const { setUser } = useUsers();

  function handleSubmit() {
    setUser(userName);
    props.onHide();
  }

  return (
    <Modal
      {...props}
      size="sm"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Sign In</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="login-form">
          <label htmlFor="user">User Name: </label>
          <input
            type="text"
            id="user"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleSubmit}>Submit</Button>
      </Modal.Footer>{" "}
    </Modal>
  );
}
