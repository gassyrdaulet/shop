import { useEffect, useState, useMemo } from "react";
import { getGoods, getGroups, newGroup, uploadXLSX } from "../api/GoodService";
import Loading from "../components/Loading";
import GoodRow from "../components/GoodRow";
import GoodsHeaders from "../components/GoodsHeaders";
import cl from "../styles/Goods.module.css";
import SearchInput from "../components/SearchInput";
import GroupRow from "../components/GroupRow";
import { BsPlusCircle } from "react-icons/bs";
import { AiOutlineSync } from "react-icons/ai";
import Modal from "../components/Modal";
import LegendInput from "../components/LegendInput";
import MyButton from "../components/MyButton";
import Select from "../components/Select";
import { useNavigate } from "react-router-dom";

function Goods() {
  const [goods, setGoods] = useState([]);
  const [fetchGoodsLoading, setFetchGoodsLoading] = useState(true);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [newGroupModal, setNewGroupModal] = useState(false);
  const [importGoodsModal, setImportGoodsModal] = useState(false);
  const [newGroupLoading, setNewGroupLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [file, setFile] = useState();
  const [sort, setSort] = useState({ key: "none" });
  const [groups, setGroups] = useState([]);
  const [selectedSort, setSelectedSort] = useState(-2);
  const fetch = () => {
    getGoods({ setFetchGoodsLoading, setGoods });
    getGroups({ setGroupsLoading, setGroups });
  };
  const navigate = useNavigate();
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const buttons = [
    {
      icon: <AiOutlineSync />,
      text: "Импорт",
      onClick: () => setImportGoodsModal(true),
    },
    {
      icon: <BsPlusCircle />,
      text: "Товар",
      onClick: () => navigate("/goods/new"),
    },
    {
      icon: <BsPlusCircle />,
      text: "Группа товаров",
      onClick: () => setNewGroupModal(true),
    },
  ];

  useEffect(() => {
    getGoods({ setFetchGoodsLoading, setGoods });
  }, []);

  useEffect(() => {
    getGroups({ setGroupsLoading, setGroups });
  }, []);

  const sortedGoods = useMemo(() => {
    try {
      const sortedArray = [...goods].sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      return sortedArray;
    } catch (e) {
      console.log(e);
      return [];
    }
  }, [goods]);

  const sortedGroups = useMemo(() => {
    try {
      const sortedArray = [...groups].sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      return sortedArray;
    } catch (e) {
      console.log(e);
      return [];
    }
  }, [groups]);

  const sortFilteredGoods = useMemo(() => {
    try {
      if (selectedSort === -2) {
        return [...sortedGoods];
      }
      const temp = [...sortedGoods].filter((good) => {
        return good.series === selectedSort;
      });
      return temp;
    } catch (e) {
      console.log(e);
      return [];
    }
  }, [sortedGoods, selectedSort]);

  const sortedGoodsByKeys = useMemo(() => {
    try {
      const none = "none";
      const numeric = "numeric";
      const text = "text";
      if (sort.key === none) {
        return sortFilteredGoods;
      }
      if (sort.type === text) {
        const temp = [...sortFilteredGoods].sort((a, b) => {
          return (
            (sort.inverse ? -1 : 1) *
            (a[sort.key] + "").localeCompare(b[sort.key] + "")
          );
        });
        return temp;
      }
      if (sort.type === numeric) {
        const temp = [...sortFilteredGoods].sort((a, b) => {
          const result =
            (sort.inverse ? 1 : -1) *
            (parseInt(a[sort.key]) > parseInt(b[sort.key]) ? -1 : 1);
          return result;
        });
        return temp;
      }
      return [];
    } catch (e) {
      console.log(e);
      return [];
    }
  }, [sortFilteredGoods, sort]);

  const filteredGoods = useMemo(() => {
    try {
      const temp = [...sortedGoodsByKeys].filter(
        (good) =>
          good.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          good?.barcode?.toLowerCase()?.includes(searchInput.toLowerCase()) ||
          (good.id + "").toLowerCase().includes(searchInput.toLowerCase())
      );
      return temp;
    } catch (e) {
      console.log(e);
      return [];
    }
  }, [sortedGoodsByKeys, searchInput]);

  const totalInfo = useMemo(() => {
    let purchaseSum = 0;
    let totalSum = 0;
    let remainderSum = 0;
    filteredGoods.forEach((good) => {
      purchaseSum += good.purchase * good.remainder;
      totalSum += good.price * good.remainder;
      remainderSum += good.remainder;
    });
    const purchaseSumParsed = new Intl.NumberFormat("ru").format(purchaseSum);
    const totalSumParsed = new Intl.NumberFormat("ru").format(totalSum);
    const remainderSumParsed = new Intl.NumberFormat("ru").format(remainderSum);
    return { purchaseSumParsed, totalSumParsed, remainderSumParsed };
  }, [filteredGoods]);

  return (
    <div className="pageWrapper">
      <div className={cl.Options}>
        <div></div>
        <div className={cl.OptionsButtons}>
          {buttons.map((button) => {
            return (
              <div
                key={button.text}
                onClick={button.onClick}
                className={cl.OptionsButton}
              >
                {button.icon}
                {button.text}
              </div>
            );
          })}
        </div>
      </div>
      <div className={cl.goodsWrapper}>
        <div className={cl.groupsWrapper}>
          <div className={cl.TotalInfoWrapper}>
            <p className={cl.TotalInfoTitle}>Общее количество:</p>
            <div className={cl.TotalInfo}>
              <p className={cl.TotalInfoText}>
                {totalInfo.remainderSumParsed} шт.
              </p>
            </div>
          </div>
          <div className={cl.TotalInfoWrapper}>
            <p className={cl.TotalInfoTitle}>Себестоимость товаров:</p>
            <div className={cl.TotalInfo}>
              <p className={cl.TotalInfoText}>
                {totalInfo.purchaseSumParsed} тг
              </p>
            </div>
          </div>
          <div className={cl.TotalInfoWrapper}>
            <p className={cl.TotalInfoTitle}>Стоимость товаров (розница):</p>
            <div className={cl.TotalInfo}>
              <p className={cl.TotalInfoText}>{totalInfo.totalSumParsed} тг</p>
            </div>
          </div>
          <p
            className={
              cl.GroupName + " " + (selectedSort === -2 ? cl.ActiveSort : "")
            }
            style={{ fontWeight: "bold" }}
            onClick={() => setSelectedSort(-2)}
          >
            Все группы товаров {`(${goods.length})`}
          </p>
          <p
            className={
              cl.GroupName + " " + (selectedSort === -1 ? cl.ActiveSort : "")
            }
            style={{ fontWeight: "bold" }}
            onClick={() => setSelectedSort(-1)}
          >
            Товары без группы
          </p>
          {groupsLoading ? (
            <div className={cl.Center}>
              <Loading which="gray" />
            </div>
          ) : (
            sortedGroups.map((item) => {
              return (
                <GroupRow
                  className={selectedSort === item.id ? cl.ActiveSort : ""}
                  key={item.id}
                  setGroup={setSelectedSort}
                  id={item.id}
                  fetch={fetch}
                >
                  {item.name}
                </GroupRow>
              );
            })
          )}
        </div>
        <div className={cl.TableMainWrapper}>
          <Select
            options={groups}
            loading={groupsLoading}
            setValue={setSelectedSort}
            className={cl.Select}
          />
          <SearchInput
            placeholder="Поиск товара"
            value={searchInput}
            setValue={setSearchInput}
            className={cl.SearchInput}
          />
          <div className={cl.tableWrapper}>
            {fetchGoodsLoading ? (
              <div className={cl.Center}>
                <Loading which="gray" />
              </div>
            ) : (
              <table>
                <thead>
                  <GoodsHeaders sort={sort} setSort={setSort} />
                </thead>
                {filteredGoods.length === 0 ? (
                  <tbody style={{ width: "100%", textAlign: "center" }}>
                    <tr>
                      <td colSpan={10}>Ничего не найдено</td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {filteredGoods.map((good, index) => {
                      return (
                        <GoodRow
                          fetch={fetch}
                          key={good.id}
                          good={good}
                          index={index + 1}
                        />
                      );
                    })}
                  </tbody>
                )}
              </table>
            )}
          </div>
        </div>
      </div>
      <Modal
        noEscape={newGroupLoading}
        modalVisible={newGroupModal}
        setModalVisible={setNewGroupModal}
      >
        <div className={cl.NewGroupModal}>
          <p>Добавить группу товаров</p>
          <LegendInput
            value={newGroupName}
            setValue={setNewGroupName}
            type="text"
            legend="Название группы"
            inputMode="text"
            disabled={newGroupLoading}
          />
          <MyButton
            text="Добавить"
            isLoading={newGroupLoading}
            onClick={async () => {
              await newGroup({
                setNewGroupLoading,
                newGroupName,
                setNewGroupModal,
                update: () => {
                  fetch();
                  setNewGroupModal(false);
                  setNewGroupName("");
                },
              });
            }}
          />
        </div>
      </Modal>
      <Modal
        noEscape={importLoading}
        modalVisible={importGoodsModal}
        setModalVisible={setImportGoodsModal}
      >
        <div className={cl.NewGroupModal}>
          <p style={{ textAlign: "center" }}>
            Импортируйте .xlsx файл <br /> с товарами
          </p>
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <input
              disabled={importLoading}
              type="file"
              onChange={handleFileChange}
            />
          </div>
          <MyButton
            text="Импортировать"
            isLoading={importLoading}
            disabled={!file}
            onClick={async () => {
              uploadXLSX({
                file,
                setImportLoading,
                next: (data) => {
                  console.log(data);
                },
              });
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

export default Goods;
