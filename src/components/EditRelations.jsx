import { useMemo, useState, useEffect, useCallback } from "react";
import Button from "./Button";
import {
  BiTrash,
  BiCheckCircle,
  BiPlusCircle,
  BiPencil,
  BiChevronLeftCircle,
} from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import SearchInput from "./SearchInput";
import Modal from "./Modal";
import cl from "../styles/Goods.module.css";
import Loading from "./Loading";
import TextButton from "./TextButton";
import LegendInput from "./LegendInput";
import {
  deleteRelation,
  editRelation,
  getRelations,
  newRelation,
} from "../api/GoodService";
import { getGoodsAndGroups } from "../api/GoodService";
import { BsTrash } from "react-icons/bs";

function EditRelations() {
  const [processLoading, setProcessLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGoodModal, setNewGoodModal] = useState(false);
  const [goodsVisible, setGoodsVisible] = useState(false);
  const [editRelationModal, setEditRelationModal] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [addNewRelationLoading, setAddNewRelationLoading] = useState(false);
  const [pickedRelation, setPickedRelation] = useState({});
  const [selectedGroup, setSelectedGroup] = useState({});
  const [searchInput, setSearchinput] = useState("");
  const [search, setSearch] = useState("");
  const [newRelationCode, setNewRelationCode] = useState("");
  const [fetchGoodsAndGroupsLoading, setFetchGoodsAndGroupsLoading] =
    useState(true);
  const [fetchedGoods, setFetchedGoods] = useState([]);
  const [fetchedGroups, setFetchedGroups] = useState([]);
  const [goods, setGoods] = useState([]);
  const [relations, setRelations] = useState([]);
  const [sortById, setSortById] = useState(true);
  const navigate = useNavigate();

  const sortedRelations = useMemo(() => {
    try {
      if (sortById) {
        const sortedArray = [...relations].sort((a, b) => {
          return -(a.id > b.id);
        });
        return sortedArray;
      }
      const sortedArray = [...relations].sort((a, b) => {
        return a.code.localeCompare(b.code);
      });
      return sortedArray;
    } catch {
      return [];
    }
  }, [relations, sortById]);

  const filteredRelations = useMemo(() => {
    try {
      const temp = [...sortedRelations].filter(
        (relation) =>
          relation.code.toLowerCase().includes(searchInput.toLowerCase()) ||
          (relation.id + "").toLowerCase().includes(searchInput.toLowerCase())
      );
      return temp;
    } catch {
      return [];
    }
  }, [searchInput, sortedRelations]);

  const sortFilteredGoods = useMemo(() => {
    try {
      if (!selectedGroup?.id) {
        return [...fetchedGoods];
      }
      const temp = [...fetchedGoods].filter((good) => {
        return good.series === selectedGroup.id;
      });
      return temp;
    } catch (e) {
      console.log(e);
      return [];
    }
  }, [fetchedGoods, selectedGroup]);

  const filteredGoods = useMemo(() => {
    try {
      const temp = [...sortFilteredGoods].filter(
        (good) =>
          good.name.toLowerCase().includes(search.toLowerCase()) ||
          good.barcode.toLowerCase().includes(search.toLowerCase()) ||
          (good.id + "").toLowerCase().includes(search.toLowerCase())
      );
      return temp;
    } catch (e) {
      console.log(e);
      return [];
    }
  }, [sortFilteredGoods, search]);

  const settingRow = useMemo(() => {
    return {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      margin: "10px 0",
    };
  }, []);

  const newGood = useCallback((id, name) => {
    setGoods((prev) => {
      const temp = [...prev];
      for (let good of temp) {
        if (good.id === id) {
          good.quantity = good.quantity + 1;
          return temp;
        }
      }
      temp.push({ id, name, quantity: 1 });
      return temp;
    });
  }, []);

  const deleteGood = useCallback((id) => {
    setGoods((prev) => {
      const temp = prev.filter((good) => {
        return good.id !== id;
      });
      return temp;
    });
  }, []);

  useEffect(() => {
    getGoodsAndGroups({
      setFetchLoading: setFetchGoodsAndGroupsLoading,
      setGoods: setFetchedGoods,
      setGroups: setFetchedGroups,
      next: () => {},
    });
    getRelations({ setFetchLoading, setRelations });
  }, []);

  useEffect(() => {
    if (search !== "") {
      setGoodsVisible(true);
    } else {
      setGoodsVisible(false);
      setSelectedGroup({});
    }
  }, [search]);

  useEffect(() => {
    if (!editRelationModal) {
      setPickedRelation({});
    }
  }, [editRelationModal]);

  useEffect(() => {
    if (!modalVisible || !editRelationModal) {
      setGoods([]);
    }
  }, [modalVisible, editRelationModal]);

  useEffect(() => {
    if (Object.keys(pickedRelation).length === 0) {
      return;
    }
    setGoods(pickedRelation.goods);
  }, [pickedRelation]);

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
          disabled={processLoading || fetchGoodsAndGroupsLoading}
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
          <div
            className={cl.tableWrapper}
            style={{ height: "inherit", maxHeight: "100vh" }}
          >
            {fetchLoading ? (
              <div className={cl.Center}>
                <Loading which="gray" />
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>№</th>
                    <th
                      onClick={() => {
                        setSortById(!sortById);
                      }}
                    >
                      ID
                    </th>
                    <th>Артикул</th>
                    <th>Товары</th>
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
                            <a
                              rel="noreferrer"
                              href={"https://kaspi.kz/shop/p/-" + relation.code}
                              target="_blank"
                            >
                              <TextButton
                                text={relation.code}
                                onClick={() => {}}
                              />
                            </a>
                          </td>
                          <td style={{ minWidth: 150, maxWidth: 250 }}>
                            {relation.goods.map((good, index) => {
                              return (
                                <p key={good.id} style={{ fontSize: 9 }}>
                                  {index + 1}) {good.quantity}шт. {good.name}{" "}
                                  (ID: {good.id})
                                </p>
                              );
                            })}
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
                                setPickedRelation(relation);
                                setEditRelationModal(true);
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
        noEscape={addNewRelationLoading || newGoodModal}
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
        <div className={cl.Center} style={{ margin: "10px 0" }}>
          <Button
            disabled={fetchGoodsAndGroupsLoading}
            text="Добавить товар"
            onClick={() => {
              setNewGoodModal(true);
            }}
            icon={<BiPlusCircle />}
          />
        </div>
        <div className={cl.tableWrapper} style={{ height: "inherit" }}>
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>ID</th>
                <th>Наименование</th>
                <th>Количество</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {goods.length === 0 ? (
                <tr>
                  <td colSpan={1000 - 7}>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      Ничего не найдено
                    </div>
                  </td>
                </tr>
              ) : (
                goods.map((good, index) => {
                  return (
                    <tr key={good.id}>
                      <td>{index + 1}</td>
                      <td>{good.id}</td>
                      <td>{good.name}</td>
                      <td style={{ textAlign: "center" }}>{good.quantity}</td>
                      <td>
                        <div className={cl.MoreButtonWrapper}>
                          <div
                            onClick={() => deleteGood(good.id)}
                            className={cl.MoreButton}
                          >
                            <BsTrash color="red" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
              newRelation({
                setNewRelationLoading: setAddNewRelationLoading,
                code: newRelationCode,
                goods,
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
        noEscape={processLoading || newGoodModal}
        modalVisible={editRelationModal}
        setModalVisible={setEditRelationModal}
      >
        <p style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20 }}>
          Редактирование: {pickedRelation?.id}
        </p>
        <p style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20 }}>
          {pickedRelation?.code}
        </p>
        <div className={cl.Center} style={{ margin: "10px 0" }}>
          <Button
            disabled={fetchGoodsAndGroupsLoading}
            text="Добавить товар"
            onClick={() => {
              setNewGoodModal(true);
            }}
            icon={<BiPlusCircle />}
          />
        </div>
        <div className={cl.tableWrapper} style={{ height: "inherit" }}>
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>ID</th>
                <th>Наименование</th>
                <th>Количество</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {goods.length === 0 ? (
                <tr>
                  <td colSpan={1000 - 7}>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      Ничего не найдено
                    </div>
                  </td>
                </tr>
              ) : (
                goods.map((good, index) => {
                  return (
                    <tr key={good.id}>
                      <td>{index + 1}</td>
                      <td>{good.id}</td>
                      <td>{good.name}</td>
                      <td style={{ textAlign: "center" }}>{good.quantity}</td>
                      <td>
                        <div className={cl.MoreButtonWrapper}>
                          <div
                            onClick={() => deleteGood(good.id)}
                            className={cl.MoreButton}
                          >
                            <BsTrash color="red" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
                goods,
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
      <Modal setModalVisible={setNewGoodModal} modalVisible={newGoodModal}>
        <div className={cl.AddGood}>
          <div className={cl.navigationWrapper}>
            <div className={cl.navigation}>
              <div
                onClick={() => {
                  if (goodsVisible) {
                    setGoodsVisible(false);
                    setSelectedGroup({});
                    setSearch("");
                  } else {
                    setNewGoodModal(false);
                  }
                }}
                className={cl.navigationButton}
              >
                <BiChevronLeftCircle size={25} />
                Назад
              </div>
              <p className={cl.NavigationGroupName}>{selectedGroup?.name}</p>
              <SearchInput
                autoFocus={true}
                placeholder="Поиск"
                value={search}
                setValue={setSearch}
              />
            </div>
          </div>
          <div className={cl.itemsWrapper}>
            {goodsVisible ? (
              <div className={cl.GoodItems}>
                {filteredGoods.map((good) => {
                  return (
                    <div
                      key={good.id}
                      onClick={() => {
                        newGood(good.id, good.name);
                        setSelectedGroup({});
                        setGoodsVisible(false);
                        setSearch("");
                        setNewGoodModal(false);
                      }}
                      className={cl.OptionsButton}
                    >
                      {good.name}
                      {` (id:${good.id}) Остаток: ${good.remainder} ${good.unit}`}
                    </div>
                  );
                })}
                {filteredGoods.length === 0 ? "Нет товаров" : ""}
              </div>
            ) : (
              <div className={cl.GroupItems}>
                <div
                  onClick={() => {
                    setSelectedGroup({
                      id: -1,
                      name: "Товары без группы",
                    });
                    setGoodsVisible(true);
                  }}
                  className={cl.OptionsButton}
                >
                  Товары без группы
                </div>
                {fetchedGroups.map((group) => {
                  return (
                    <div
                      key={group.id}
                      onClick={() => {
                        setSelectedGroup(group);
                        setGoodsVisible(true);
                      }}
                      className={cl.OptionsButton}
                    >
                      {group.name}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default EditRelations;
