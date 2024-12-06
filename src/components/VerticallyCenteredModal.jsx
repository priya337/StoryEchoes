import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function VerticallyCenteredModal({
  show,
  setShow,
  size,
  header,
  message,
  onDelete,
}) {
  const handleClose = (e) => {
    e.preventDefault();
    setShow(false);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    onDelete();
    handleClose();
  };

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        animation={false}
        size={size}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{header}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default VerticallyCenteredModal;
