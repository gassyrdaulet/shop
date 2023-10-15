import moment from "moment";
import Modal from "./Modal";
import cl from "../styles/Goods.module.css";
import { useState } from "react";
import { deleteSpending } from "../api/OrganizationService";
import MyButton from "./MyButton";
import { BsTrash } from "react-icons/bs";

function SpendingRow({ spending, index, purpose, update }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  return (
    <tr>
      <td
        style={{ maxWidth: 25, width: 25, minWidth: 25, textAlign: "center" }}
      >
        {index}
      </td>
      <td
        style={{ maxWidth: 25, width: 25, minWidth: 25, textAlign: "center" }}
      >
        {spending.id}
      </td>
      <td>{purpose}</td>
      <td>{spending.sum.toFixed(2)} тг.</td>
      <td style={{ textAlign: "center" }}>
        {moment(spending.date).format("DD.MM.yyyy HH:mm")}
      </td>
      <td style={{ textAlign: "center" }}>{spending.comment}</td>
      <td style={{ textAlign: "center" }}>
        {spending.username + ` (ID: ${spending.user})`}
        <Modal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          noEscape={deleteLoading}
        >
          <div className={cl.ExitModalWrapper}>
            <p className={cl.Question}>
              Вы уверены что хотите удалить этот расход?
            </p>
            <div className={cl.ExitModalButtons}>
              <MyButton
                onClick={() => setModalVisible(false)}
                text="Нет"
                disabled={deleteLoading}
              />
              <MyButton
                isLoading={deleteLoading}
                onClick={() =>
                  deleteSpending({
                    setProcessLoading: setDeleteLoading,
                    id: spending.id,
                    next: update,
                  })
                }
                text="Да"
              />
            </div>
          </div>
        </Modal>
      </td>
      <td>
        <div
          className={cl.MoreButtonWrapper}
          onClick={() => setModalVisible(true)}
        >
          <div className={cl.MoreButton}>
            <BsTrash />
          </div>
        </div>
      </td>
    </tr>
  );
}

export default SpendingRow;
