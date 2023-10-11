import cl from "../styles/Goods.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { BsArrowLeftCircle } from "react-icons/bs";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { BiChevronLeftCircle } from "react-icons/bi";
import { useEffect, useState, useMemo, useCallback } from "react";
import LegendInput from "../components/LegendInput";
import moment from "moment";
import AcGoodsHeaders from "../components/AcGoodsHeaders";
import AcGoodRow from "../components/AcGoodRow";
import Modal from "../components/Modal";
import { getGoodsAndGroups } from "../api/GoodService";
import SearchInput from "../components/SearchInput";
import { newAcceptance, newWriteOff } from "../api/WarehouseService";
import useAuth from "../hooks/useAuth";
import Button from "../components/Button";

function NewAcceptance() {
  const [newAcceptLoading, setNewAcceptLoading] = useState(false);
  const [date, setDate] = useState(moment().format("yyyy-MM-DD"));
  const [comment, setComment] = useState("");
  const [addGoodModal, setAddGoodModal] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [goods, setGoods] = useState([]);
  const [fetchedGoods, setFetchedGoods] = useState([]);
  const [search, setSearch] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [selectedGroup, setSelectedGroup] = useState([]);
  const [fetchedGroups, setFetchedGroups] = useState([]);
  const [goodsVisible, setGoodsVisible] = useState(false);
  const navigate = useNavigate();
  const { type } = useParams();
  const { alert } = useAuth();

  const newGood = useCallback(
    (good) => {
      setGoods((prev) => {
        console.log(prev);
        if (type === "wo") {
          if (good.remainder <= 0) {
            alert("Ошибка", "Товара нет в наличии.");
            return prev;
          }
        }
        const temp = [...prev];
        for (let item of temp) {
          if (item.id === good.id) {
            if (item.quantity + 1 > good.remainder) {
              if (type === "wo") {
                return prev;
              }
            }
            item.quantity = parseInt(item.quantity) + 1;
            return temp;
          }
        }
        temp.push(good);
        return temp;
      });
    },
    [alert, type]
  );

  useEffect(() => {
    getGoodsAndGroups({
      setFetchLoading,
      setGoods: setFetchedGoods,
      setGroups: setFetchedGroups,
      next: () => {},
    });
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
    const handleEvent = (e) => {
      if (e.target.id === "main") {
        if (e.key === "Backspace") {
          setBarcodeInput(barcodeInput.slice(0, barcodeInput.length - 1));
          return;
        }
        if (e.key === "Enter") {
          if (fetchLoading) {
            return;
          }
          const temp = [...fetchedGoods];
          for (let item of temp) {
            if (item.barcode === barcodeInput) {
              newGood({
                id: item.id,
                name: item.name,
                price:
                  type === "ac"
                    ? item.inventories?.length > 0
                      ? item.inventories[0].price
                      : 0
                    : item.price,
                quantity: 1,
                remainder: item.remainder,
              });
              break;
            }
          }
          setBarcodeInput("");
          return;
        }
        if (e.key.length > 1) {
          return;
        }
        if (!/[\da-zA-Zа-яА-Яё]/.test(e.key)) {
          return;
        }
        if (barcodeInput.length >= 20) {
          setBarcodeInput(barcodeInput.slice(1, barcodeInput.length) + e.key);
          return;
        }
        setBarcodeInput(barcodeInput + e.key);
      }
    };
    document.addEventListener("keydown", handleEvent);
    return () => {
      document.removeEventListener("keydown", handleEvent);
    };
  }, [barcodeInput, fetchLoading, fetchedGoods, type, newGood]);

  const sortFilteredGoods = useMemo(() => {
    try {
      if (!selectedGroup.id) {
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

  const buttons = [
    {
      disabled: newAcceptLoading,
      icon: <BsArrowLeftCircle />,
      text: "Назад к " + (type === "ac" ? "приемкам" : "списаниям"),
      onClick: () => {
        navigate(
          "/warehouse/inventory/" + (type === "ac" ? "acceptance" : "writeoff")
        );
      },
    },
  ];
  const buttons2 = [
    {
      disabled: newAcceptLoading,
      icon: <AiOutlineCheckCircle />,
      text: "Сохранить " + (type === "ac" ? "приемку" : "списание"),
      onClick: () => {
        const body = {
          goods,
          date: moment(date).valueOf(),
          comment,
          setNewAcceptLoading,
          next: () => {
            navigate(
              "/warehouse/inventory/" +
                (type === "ac" ? "acceptance" : "writeoff")
            );
          },
        };
        if (type === "ac" || type === "acceptance") {
          newAcceptance(body);
          return;
        }
        newWriteOff(body);
      },
    },
  ];

  return (
    <div className="pageWrapper">
      <div className={cl.Options}>
        <div className={cl.OptionsButtons}>
          {buttons.map((button) => {
            return (
              <button
                disabled={newAcceptLoading}
                key={button.text}
                onClick={button.onClick}
                className={cl.OptionsButton}
              >
                {button.icon}
                {button.text}
              </button>
            );
          })}
        </div>
        <div className={cl.OptionsButtons}>
          {buttons2.map((button) => {
            return (
              <button
                disabled={button.disabled}
                key={button.text}
                onClick={button.onClick}
                className={cl.OptionsButton}
              >
                {button.icon}
                {button.text}
              </button>
            );
          })}
        </div>
      </div>
      <div className={cl.goodsWrapper}>
        <div className={cl.groupsWrapper} style={{ padding: "5px" }}>
          <LegendInput
            type="date"
            value={date}
            disabled={newAcceptLoading}
            legend="Дата"
            setValue={(v) => setDate(v)}
          />
          <LegendInput
            type="text"
            disabled={newAcceptLoading}
            value={comment}
            setValue={setComment}
            legend="Заметка"
            inputMode="text"
            textarea={true}
            inputStyle={{ minHeight: 180, width: "100%" }}
            maxLength={500}
          />
          <p style={{ fontSize: 14 }}>Баркод: {barcodeInput}</p>
        </div>
        <div className={cl.secondHalf}>
          <div className={cl.inputsMobile}>
            <LegendInput
              type="date"
              value={date}
              legend="Дата"
              disabled={newAcceptLoading}
              setValue={(v) => setDate(v)}
            />
            <LegendInput
              type="text"
              value={comment}
              disabled={newAcceptLoading}
              setValue={setComment}
              legend="Заметка"
              inputMode="text"
              textarea={true}
              inputStyle={{ minHeight: 90, width: "100%" }}
              maxLength={500}
            />
            <p style={{ fontSize: 14 }}>Баркод: {barcodeInput}</p>
          </div>
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                margin: "25px 0 10px 0",
              }}
            >
              <p style={{ userSelect: "none" }}>Список товаров</p>
              <div>
                <button
                  disabled={fetchLoading || newAcceptLoading}
                  onClick={() => setAddGoodModal(true)}
                  className={cl.OptionsButton}
                >
                  Добавить товар
                </button>
              </div>
            </div>
            <div className={cl.tableWrapper}>
              <table>
                <thead>
                  <AcGoodsHeaders type={type} />
                </thead>
                {goods.length === 0 ? (
                  <tbody style={{ width: "100%", textAlign: "center" }}>
                    <tr>
                      <td colSpan={10}>Ничего не найдено</td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {goods.map((good, index) => {
                      return (
                        <AcGoodRow
                          type={type}
                          editable={!newAcceptLoading}
                          fetch={fetch}
                          key={good.id}
                          good={good}
                          index={index + 1}
                          setGoods={setGoods}
                          goods={goods}
                        />
                      );
                    })}
                  </tbody>
                )}
              </table>
            </div>
            <Modal
              setModalVisible={setAddGoodModal}
              modalVisible={addGoodModal}
            >
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
                          setAddGoodModal(false);
                        }
                      }}
                      className={cl.navigationButton}
                    >
                      <BiChevronLeftCircle size={25} />
                      Назад
                    </div>

                    <Button
                      text="Выбрать все"
                      onClick={() => {
                        for (let good of filteredGoods) {
                          newGood({
                            id: good.id,
                            name: good.name,
                            price:
                              type === "ac"
                                ? good.inventories?.length > 0
                                  ? good.inventories[0].price
                                  : good.purchase
                                : good.price,
                            quantity: 1,
                            remainder: good.remainder,
                          });
                        }
                      }}
                      className={cl.NavigationGroupName}
                    />
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
                              newGood({
                                id: good.id,
                                name: good.name,
                                price:
                                  type === "ac"
                                    ? good.inventories?.length > 0
                                      ? good.inventories[0].price
                                      : good.purchase
                                    : good.price,
                                quantity: 1,
                                remainder: good.remainder,
                              });
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
        </div>
      </div>
    </div>
  );
}

export default NewAcceptance;
