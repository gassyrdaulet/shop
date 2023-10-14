import { useState, useEffect, useCallback, useMemo } from "react";
import { BsPrinterFill } from "react-icons/bs";
import { BiChevronLeftCircle, BiDownload, BiPrinter } from "react-icons/bi";
import cl from "../styles/Goods.module.css";
import { getGoodsAndGroups } from "../api/GoodService";
import Modal from "../components/Modal";
import SearchInput from "../components/SearchInput";
import LabelRow from "../components/LabelRow";
import LabelRowHeaders from "../components/LabelRowHeaders";
import * as qz from "qz-tray";
import JsBarcode from "jsbarcode";
import Button from "../components/Button";
import { createPDFLabels } from "../api/PrinterService";

function Labels() {
  const [processLoading, setProcessLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [addGoodModal, setAddGoodModal] = useState(false);
  const [goodsVisible, setGoodsVisible] = useState(false);
  const [printerConnected, setPrinterConnected] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [search, setSearch] = useState("");
  const [goods, setGoods] = useState([]);
  const [pickedGoods, setPickedGoods] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isTherePrinters, setIsTherePrinters] = useState(false);

  const buttons = [];
  const buttons2 = [
    {
      disabled: processLoading || !isTherePrinters || !printerConnected,
      icon: <BsPrinterFill />,
      text: "Печатать",
      onClick: () => {
        createPDFLabels(setProcessLoading, pickedGoods, true);
      },
    },
    {
      disabled: processLoading,
      icon: <BiDownload />,
      text: "Скачать",
      onClick: () => {
        createPDFLabels(setProcessLoading, pickedGoods, false);
      },
    },
  ];

  const sortFilteredGoods = useMemo(() => {
    try {
      if (!selectedGroup.id) {
        return [...goods];
      }
      const temp = [...goods].filter((good) => {
        return good.series === selectedGroup.id;
      });
      return temp;
    } catch (e) {
      console.log(e);
      return [];
    }
  }, [goods, selectedGroup]);

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

  useEffect(() => {
    JsBarcode("#barcode", "Hi!");
    getGoodsAndGroups({ setFetchLoading, setGoods, setGroups, next: () => {} });
  }, []);

  const connectPrinter = () => {
    try {
      if (printerConnected) {
        qz.websocket.disconnect().then(() => {
          setPrinterConnected(false);
        });
      } else {
        qz.websocket
          .connect()
          .then(() => {
            setPrinterConnected(true);
            return qz.printers.find();
          })
          .then((printers) => {
            if (printers?.length === 0) {
              setIsTherePrinters(false);
            } else {
              setIsTherePrinters(true);
            }
          });
      }
    } catch (e) {
      console.log("QZ connect Error:", e?.message);
    }
  };

  useEffect(() => {
    qz.websocket
      .connect()
      .then(() => {
        setPrinterConnected(true);
        return qz.printers.find();
      })
      .then((printers) => {
        if (printers?.length === 0) {
          setIsTherePrinters(false);
        } else {
          setIsTherePrinters(true);
        }
      })
      .catch((e) => {
        setIsTherePrinters(false);
        console.log("QZ connect Error:", e?.message);
      });
    return () => {
      qz.websocket
        .disconnect()
        .then(() => {
          setPrinterConnected(false);
        })
        .catch((e) => {
          console.log("QZ disconnect Error:", e?.message);
        });
    };
  }, []);

  const newGood = useCallback((good) => {
    setPickedGoods((prev) => {
      const temp = [...prev];
      for (let item of temp) {
        if (item.id === good.id) {
          item.quantity = parseInt(item.quantity) + 1;
          return temp;
        }
      }
      temp.push(good);
      return temp;
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
          const temp = [...goods];
          for (let item of temp) {
            if (item.barcode === barcodeInput) {
              newGood({
                id: item.id,
                name: item.name,
                quantity: 1,
                price: item.price,
                barcode: item.barcode,
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
  }, [barcodeInput, fetchLoading, goods, newGood]);

  return (
    <div className="pageWrapper">
      <div className={cl.Options}>
        <div className={cl.OptionsButtons}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              userSelect: "none",
            }}
            onClick={connectPrinter}
          >
            <BiPrinter
              size={30}
              color={printerConnected ? "#24cd24" : "#cd2424"}
            />
            <p>
              {printerConnected ? "Принтер работает" : "Принтер не подключен"}
            </p>
          </div>

          {buttons.map((button) => {
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
        <div className={cl.OptionsButtons}>
          <button
            disabled={fetchLoading || processLoading}
            onClick={() => setAddGoodModal(true)}
            className={cl.OptionsButton}
          >
            Добавить товар
          </button>
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
        <div
          className={cl.groupsWrapper}
          style={{ padding: "5px", alignItems: "center" }}
        >
          <svg id="barcode"></svg>
        </div>
        <div className={cl.secondHalf}>
          <div className={cl.inputsMobile}></div>
          <div className={cl.tableWrapper}>
            <table>
              <thead>
                <LabelRowHeaders />
              </thead>
              {pickedGoods.length === 0 ? (
                <tbody style={{ width: "100%", textAlign: "center" }}>
                  <tr>
                    <td colSpan={10}>Товары не выбраны</td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {pickedGoods.map((good, index) => {
                    return (
                      <LabelRow
                        editable={!processLoading}
                        fetch={fetch}
                        key={good.id}
                        good={good}
                        index={index + 1}
                        setGoods={setPickedGoods}
                        goods={pickedGoods}
                      />
                    );
                  })}
                </tbody>
              )}
            </table>
          </div>
        </div>
      </div>
      <Modal setModalVisible={setAddGoodModal} modalVisible={addGoodModal}>
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
                      quantity: 1,
                      price: good.price,
                      barcode: good.barcode,
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
                          quantity: 1,
                          price: good.price,
                          barcode: good.barcode,
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
                {groups.map((group) => {
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

export default Labels;
