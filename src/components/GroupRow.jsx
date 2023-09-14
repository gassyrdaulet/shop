import { BsPencil } from "react-icons/bs";
import { useState } from "react";
import Modal from "../components/Modal";
import cl from "../styles/Goods.module.css";
import LegendInput from "./LegendInput";
import MyButton from "./MyButton";
import { deleteGroup, editGroup } from "../api/GoodService";

function GroupRow({ className, children, setGroup, id, fetch }) {
  const [editGroupModal, setEditGroupModal] = useState(false);
  const [deleteGroupModal, setDeleteGroupModal] = useState(false);
  const [deleteGroupLoading, setDeleteGroupLoading] = useState(false);
  const [editGroupLoading, setEditGroupLoading] = useState(false);
  const [editGroupName, setEditGroupName] = useState(children);

  return (
    <div>
      <p
        className={cl.GroupName + " " + className}
        onClick={() => setGroup(id)}
      >
        {children}
        <BsPencil onClick={() => setEditGroupModal(!editGroupModal)} />
      </p>
      <Modal
        noEscape={editGroupLoading || deleteGroupLoading}
        setModalVisible={setEditGroupModal}
        modalVisible={editGroupModal}
      >
        {deleteGroupModal ? (
          <div className={cl.ExitModalWrapper}>
            <p className={cl.Question}>
              Вы уверены что хотите удалить эту группу: {`«${children}»`}? Все
              товары этой группы останутся без группы.
            </p>
            <div className={cl.ExitModalButtons}>
              <MyButton
                onClick={() => setDeleteGroupModal(false)}
                text="Нет"
                disabled={deleteGroupLoading}
              />
              <MyButton
                isLoading={deleteGroupLoading}
                onClick={() =>
                  deleteGroup({
                    setDeleteGroupLoading,
                    id,
                    update: () => {
                      fetch();
                      setGroup(-2);
                    },
                  })
                }
                text="Да"
              />
            </div>
          </div>
        ) : (
          <div className={cl.NewGroupModal}>
            <p>Редактирование группы</p>
            <LegendInput
              legend="Название группы"
              value={editGroupName}
              setValue={setEditGroupName}
              type="text"
              inputMode="text"
              disabled={editGroupLoading || deleteGroupLoading}
            />
            <div className={cl.ExitModalButtons}>
              <MyButton
                text="Удалить"
                onClick={() => setDeleteGroupModal(true)}
                disabled={editGroupLoading}
              />
              <MyButton
                text="Изменить"
                onClick={() => {
                  editGroup({
                    setEditGroupLoading,
                    editGroupName,
                    id,
                    update: fetch,
                  });
                }}
                isLoading={editGroupLoading}
                disabled={deleteGroupLoading}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default GroupRow;
