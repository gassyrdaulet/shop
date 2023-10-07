import { useMemo, useState, useEffect, useCallback } from "react";
import Button from "./Button";
import {
  BiTrash,
  BiCheckCircle,
  BiCheck,
  BiPlusCircle,
  BiPencil,
} from "react-icons/bi";
import { getUsers } from "../api/OrganizationService";
import { useNavigate } from "react-router-dom";
import SearchInput from "../components/SearchInput";
import Modal from "../components/Modal";
import cl from "../styles/Goods.module.css";
import Loading from "./Loading";
import { RxCross1 } from "react-icons/rx";
import CheckBox from "../components/CheckBox";
import LegendInput from "./LegendInput";
import { addNewUser, editUser, deleteUser } from "../api/OrganizationService";

function EditUsers() {
  const [processLoading, setProcessLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editUserModal, setEditUserModal] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [addNewUserLoading, setAddNewUserLoading] = useState(false);
  const [pickedUser, setPickedUser] = useState({});
  const [searchInput, setSearchinput] = useState("");
  const [newUserId, setUserId] = useState("");
  const [newUserInfo, setUserInfo] = useState({
    admin: false,
    manager: true,
    deliver: true,
  });
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const sortedUsers = useMemo(() => {
    try {
      const sortedArray = [...users].sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      return sortedArray;
    } catch {
      return [];
    }
  }, [users]);

  const filteredUsers = useMemo(() => {
    try {
      const temp = [...sortedUsers].filter(
        (user) =>
          user.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          (user.id + "").toLowerCase().includes(searchInput.toLowerCase())
      );
      return temp;
    } catch {
      return [];
    }
  }, [searchInput, sortedUsers]);

  const handleChange = useCallback((v, setting) => {
    setPickedUser((pickedUser) => {
      const temp = { ...pickedUser };
      temp[setting] = v;
      return temp;
    });
  }, []);

  const handleChange2 = useCallback((v, setting) => {
    setUserInfo((pickedUser) => {
      const temp = { ...pickedUser };
      temp[setting] = v;
      return temp;
    });
  }, []);

  const settingRow = useMemo(() => {
    return {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      margin: "10px 0",
    };
  }, []);

  useEffect(() => {
    getUsers({ setFetchLoading, setUsers });
  }, []);

  useEffect(() => {
    if (!editUserModal) {
      setPickedUser({});
    }
  }, [editUserModal]);

  return (
    <div
      style={{
        padding: "10px 0",
        margin: "20px 0",
        maxWidth: 600,
        color: "#3d3d3d",
      }}
    >
      <p style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20 }}>
        Редактирование пользователей
      </p>
      <div style={settingRow}>
        <SearchInput
          placeholder="Поиск сотрудника"
          value={searchInput}
          setValue={setSearchinput}
        />
        <Button
          style={{ margin: "0", marginLeft: 10 }}
          icon={<BiPlusCircle />}
          disabled={processLoading}
          text="Добавить"
          onClick={() => {
            setModalVisible(true);
          }}
        />
      </div>
      <div style={settingRow}></div>
      <div style={settingRow}>
        <div
          className={cl.TableMainWrapper}
          style={{ width: "100%", maxWidth: "100%", padding: 0 }}
        >
          <div className={cl.tableWrapper} style={{ height: "inherit" }}>
            {fetchLoading ? (
              <div className={cl.Center}>
                <Loading which="gray" />
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Имя</th>
                    <th>Админ</th>
                    <th>Курьер</th>
                    <th>Создание заявок</th>
                    <th>Создание самовывоза</th>
                    <th>Создание товаров</th>
                    <th>Операторство</th>
                    <th>Кладовщик</th>
                    <th>Kaspi магазин</th>
                    <th>Редактирование заказов</th>
                    <th>Возврат заказов</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={1000 - 7}>
                        <div
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          Ничего не найдено
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => {
                      return (
                        <tr key={user.id}>
                          <td style={{ textAlign: "center" }}>{index + 1}</td>
                          <td style={{ minWidth: 150, textAlign: "center" }}>
                            {user.name} {user.owner ? "(Владелец)" : ""}
                          </td>
                          <td>
                            <CrossCheck bool={user.admin} />
                          </td>
                          <td>
                            <CrossCheck bool={user.deliver} />
                          </td>
                          <td>
                            <CrossCheck bool={user.manager} />
                          </td>
                          <td>
                            <CrossCheck bool={user.pickup} />
                          </td>
                          <td>
                            <CrossCheck bool={user.goods} />
                          </td>
                          <td>
                            <CrossCheck bool={user.operator} />
                          </td>
                          <td>
                            <CrossCheck bool={user.warehouse} />
                          </td>
                          <td>
                            <CrossCheck bool={user.kaspi} />
                          </td>
                          <td>
                            <CrossCheck bool={user.editorder} />
                          </td>
                          <td>
                            <CrossCheck bool={user.returnorder} />
                          </td>
                          <td style={{ minWidth: 100 }}>
                            <div
                              style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setPickedUser(user);
                                setEditUserModal(true);
                              }}
                            >
                              <BiPencil size={25} />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <Modal
        noEscape={addNewUserLoading}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      >
        <p style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20 }}>
          Добавить нового сотрудника:
        </p>
        <LegendInput
          value={newUserId}
          setValue={setUserId}
          legend="ID пользователя"
          disabled={addNewUserLoading}
        />
        <div style={settingRow}>
          <p>Админ</p>
          <CheckBox
            checked={newUserInfo.admin}
            disabled={processLoading}
            onChange={(e) => {
              handleChange2(e.target.checked, "admin");
            }}
          />
        </div>
        <div style={settingRow}>
          <p>Курьер</p>
          <CheckBox
            checked={newUserInfo.deliver}
            disabled={processLoading}
            onChange={(e) => {
              handleChange2(e.target.checked, "deliver");
            }}
          />
        </div>
        <div style={settingRow}>
          <p>Создание заявок</p>
          <CheckBox
            checked={newUserInfo.manager}
            disabled={processLoading}
            onChange={(e) => {
              handleChange2(e.target.checked, "manager");
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: 15,
          }}
        >
          <Button
            onClick={() => {
              addNewUser({
                newUserInfo,
                id: parseInt(newUserId),
                setAddNewUserLoading,
                next: () => navigate(0),
              });
            }}
            disabled={processLoading}
            text={"Сохранить"}
            icon={<BiCheckCircle />}
          />
        </div>
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={editUserModal}
        setModalVisible={setEditUserModal}
      >
        <p style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20 }}>
          Редактирование: {pickedUser.id}
        </p>
        <p style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20 }}>
          {pickedUser.name}
        </p>
        <div style={settingRow}>
          <p>Админ</p>
          <CheckBox
            checked={pickedUser.admin}
            disabled={processLoading}
            onChange={(e) => {
              handleChange(e.target.checked, "admin");
            }}
          />
        </div>
        <div style={settingRow}>
          <p>Курьер</p>
          <CheckBox
            checked={pickedUser.deliver}
            disabled={processLoading}
            onChange={(e) => {
              handleChange(e.target.checked, "deliver");
            }}
          />
        </div>
        <div style={settingRow}>
          <p>Создание заявок</p>
          <CheckBox
            checked={pickedUser.manager}
            disabled={processLoading}
            onChange={(e) => {
              handleChange(e.target.checked, "manager");
            }}
          />
        </div>
        <div style={settingRow}>
          <p>Создание самовывоза</p>
          <CheckBox
            checked={pickedUser.pickup}
            disabled={processLoading}
            onChange={(e) => {
              handleChange(e.target.checked, "pickup");
            }}
          />
        </div>
        <div style={settingRow}>
          <p>Создание товаров</p>
          <CheckBox
            checked={pickedUser.goods}
            disabled={processLoading}
            onChange={(e) => {
              handleChange(e.target.checked, "goods");
            }}
          />
        </div>
        <div style={settingRow}>
          <p>Операторство</p>
          <CheckBox
            checked={pickedUser.operator}
            disabled={processLoading}
            onChange={(e) => {
              handleChange(e.target.checked, "operator");
            }}
          />
        </div>
        <div style={settingRow}>
          <p>Кладовщик</p>
          <CheckBox
            checked={pickedUser.warehouse}
            disabled={processLoading}
            onChange={(e) => {
              handleChange(e.target.checked, "warehouse");
            }}
          />
        </div>
        <div style={settingRow}>
          <p>Kaspi магазин</p>
          <CheckBox
            checked={pickedUser.kaspi}
            disabled={processLoading}
            onChange={(e) => {
              handleChange(e.target.checked, "kaspi");
            }}
          />
        </div>
        <div style={settingRow}>
          <p>Редактирование заказов</p>
          <CheckBox
            checked={pickedUser.editorder}
            disabled={processLoading}
            onChange={(e) => {
              handleChange(e.target.checked, "editorder");
            }}
          />
        </div>
        <div style={settingRow}>
          <p>Возврат заказов</p>
          <CheckBox
            checked={pickedUser.returnorder}
            disabled={processLoading}
            onChange={(e) => {
              handleChange(e.target.checked, "returnorder");
            }}
          />
        </div>
        <div style={settingRow}>
          <Button
            onClick={() => {
              if (
                window.confirm(
                  "Вы действительно хотите удалить этого сотрудника?"
                )
              ) {
                deleteUser({
                  deleteId: pickedUser.id,
                  setProcessLoading,
                  next: () => navigate(0),
                });
              }
            }}
            disabled={processLoading}
            text={"Удалить"}
            icon={<BiTrash />}
          />
          <Button
            onClick={() => {
              editUser({
                pickedUserInfo: pickedUser,
                editId: pickedUser.id,
                setProcessLoading,
                next: () => navigate(0),
              });
            }}
            disabled={processLoading}
            text={"Сохранить"}
            icon={<BiCheckCircle />}
          />
        </div>
      </Modal>
    </div>
  );
}

const CrossCheck = ({ bool }) => {
  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      {bool ? (
        <BiCheck color="green" size={30} />
      ) : (
        <RxCross1 color="red" size={25} />
      )}
    </div>
  );
};

export default EditUsers;
