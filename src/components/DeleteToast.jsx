import Toast from "react-bootstrap/Toast";
import { useToast } from "../contexts/toast.context.jsx";
import { useEffect, useState } from "react";

const DeleteToast = () => {
  const { toast } = useToast();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (toast) {
      //Toast message was set. We need to show it
      setShowToast(true);

      let toastTimer = setTimeout(() => {
        setShowToast(false);
        clearTimeout(toastTimer);
      }, 2500);
    }
  }, [toast]);

  return (
    <>
      <Toast
        className="d-inline-block m-1 footer-toast"
        bg="danger"
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={1500}
      >
        <Toast.Body className="text-white toast-text">{toast}</Toast.Body>
      </Toast>
    </>
  );
};

export default DeleteToast;
