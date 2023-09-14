import { useMemo, useState, useEffect } from "react";
import Button from "./Button";
import { BiTrash, BiCheckCircle, BiPlusCircle, BiPencil } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import SearchInput from "./SearchInput";
import Modal from "./Modal";
import cl from "../styles/Goods.module.css";
import Loading from "./Loading";
import LegendInput from "./LegendInput";
import {
  deleteRelation,
  editRelation,
  getRelations,
  newRelation,
} from "../api/GoodService";

function EditRelations() {
  const [processLoading, setProcessLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editRelationModal, setEditRelationModal] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [addNewRelationLoading, setAddNewRelationLoading] = useState(false);
  const [pickedRelation, setPickedRelation] = useState({});
  const [searchInput, setSearchinput] = useState("");
  const [newRelationCode, setNewRelationCode] = useState("");
  const [newRelationGood, setNewRelationGood] = useState("");
  const [editingRelationGood, setEditingRelationGood] = useState("");
  const [relations, setRelations] = useState([]);
  const navigate = useNavigate();

  const sortedRelations = useMemo(() => {
    try {
      const sortedArray = [...relations].sort((a, b) => {
        return a.good?.name.localeCompare(b.good?.name);
      });
      return sortedArray;
    } catch {
      return [];
    }
  }, [relations]);

  const filteredRelations = useMemo(() => {
    try {
      const temp = [...sortedRelations].filter(
        (relation) =>
          relation.code.toLowerCase().includes(searchInput.toLowerCase()) ||
          (relation.good?.id + "")
            .toLowerCase()
            .includes(searchInput.toLowerCase()) ||
          relation.good?.name
            .toLowerCase()
            .includes(searchInput.toLowerCase()) ||
          (relation.id + "").toLowerCase().includes(searchInput.toLowerCase())
      );
      return temp;
    } catch {
      return [];
    }
  }, [searchInput, sortedRelations]);

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
    getRelations({ setFetchLoading, setRelations });
  }, []);

  useEffect(() => {
    if (!editRelationModal) {
      setPickedRelation({});
    }
  }, [editRelationModal]);

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
        Редактирование связей
      </p>
      <div style={settingRow}>
        <SearchInput
          placeholder="Поиск связи"
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
                    <th>ID</th>
                    <th>Артикул</th>
                    <th>Товар</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRelations.length === 0 ? (
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
                    filteredRelations.map((relation, index) => {
                      return (
                        <tr key={relation.id}>
                          <td style={{ textAlign: "center" }}>{index + 1}</td>
                          <td style={{ minWidth: 30, textAlign: "center" }}>
                            {relation.id}
                          </td>
                          <td style={{ minWidth: 100, textAlign: "center" }}>
                            {relation.code}
                          </td>
                          <td style={{ minWidth: 150, textAlign: "center" }}>
                            {relation.good?.name} (ID: {relation.good?.id})
                          </td>
                          <td style={{ minWidth: 150 }}>
                            <div
                              style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setPickedRelation(relation);
                                setEditRelationModal(true);
                                setEditingRelationGood(relation.good?.id + "");
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
        noEscape={addNewRelationLoading}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      >
        <p style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20 }}>
          Добавить новую связь:
        </p>
        <LegendInput
          value={newRelationCode}
          setValue={setNewRelationCode}
          legend="Артикул новой связи"
          disabled={addNewRelationLoading}
        />
        <LegendInput
          value={newRelationGood}
          setValue={setNewRelationGood}
          legend="ID товара"
          disabled={addNewRelationLoading}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: 15,
          }}
        >
          <Button
            onClick={() => {
              newRelation({
                setNewRelationLoading: setAddNewRelationLoading,
                code: newRelationCode,
                good: newRelationGood,
                next: () => navigate(0),
              });
            }}
            disabled={addNewRelationLoading || processLoading}
            text={"Сохранить"}
            icon={<BiCheckCircle />}
          />
        </div>
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={editRelationModal}
        setModalVisible={setEditRelationModal}
      >
        <p style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20 }}>
          Редактирование: {pickedRelation?.id}
        </p>
        <p style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20 }}>
          {pickedRelation?.code}
        </p>
        <LegendInput
          value={editingRelationGood}
          setValue={setEditingRelationGood}
          legend="ID товара"
          disabled={processLoading}
        />
        <div style={settingRow}>
          <Button
            onClick={() => {
              if (
                window.confirm("Вы действительно хотите удалить эту связь?")
              ) {
                deleteRelation({
                  setProcessLoading,
                  relationId: pickedRelation?.id,
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
              editRelation({
                relationId: pickedRelation?.id,
                good: editingRelationGood,
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

export default EditRelations;
