import { useRef, useEffect } from "react";
import { useOutsideAlerter } from "../hooks/useOutsideAlerter";
import cl from "../styles/Modal.module.css";
import useAuth from "../hooks/useAuth";

function Modal({ children, setModalVisible, modalVisible, noEscape }) {
  const modalRef = useRef(null);
  const { setFixed } = useAuth();

  useEffect(() => {
    if (modalVisible) {
      setFixed(true);
    } else {
      setFixed(false);
    }
  }, [modalVisible, setFixed]);

  useOutsideAlerter(modalRef, () => {
    if (!noEscape) {
      setModalVisible(false);
    }
  });

  return modalVisible ? (
    <div className={modalVisible ? cl.modalWrapper : cl.off}>
      <div ref={modalRef} className={cl.modal}>
        {children}
      </div>
    </div>
  ) : (
    ""
  );
}

export default Modal;
