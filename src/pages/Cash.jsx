import { useState, useEffect, useMemo, useCallback } from "react";
import { BsArrowLeftCircle, BsCashCoin } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import cl from "../styles/Goods.module.css";
import { getGoodsAndGroups } from "../api/GoodService.js";
import SearchInput from "../components/SearchInput";
import Loading from "../components/Loading";
import useAuth from "../hooks/useAuth";
import ScreenFixer from "../components/ScreenFixer";
import NoGoodHeaders from "../components/NoGoodHeaders";
import NoGoodRow from "../components/NoGoodRow";
import NoPaymentHeaders from "../components/NoPaymentHeaders";
import NoPaymentRow from "../components/NoPaymentRow";
import OrderHeadersPickup from "../components/OrderHeadersPickup";
import OrderPickup from "../components/OrderPickup";
import Modal from "../components/Modal";
import Button from "../components/Button";
import Select from "../components/Select";
import LegendInput from "../components/LegendInput";
import moment from "moment";
import {
  BiArrowToRight,
  BiCheckCircle,
  BiDownArrow,
  BiLock,
  BiLockOpen,
  BiMinusCircle,
  BiMoney,
  BiPlusCircle,
  BiSad,
  BiSearch,
  BiUpArrow,
} from "react-icons/bi";
import CheckBox from "../components/CheckBox";
import NumKeyBoard from "../components/NumKeyBoard";
import {
  getOrders,
  newOrder,
  editOrder,
  getOrderDetails,
  cashOrder,
  issueCash,
  cancelOrder,
  isThereOrder,
} from "../api/OrderService";
import {
  getManagers,
  getCashbox,
  openCashbox,
  closeCashbox,
  getOrgInfo,
  closeAnyCashbox,
  addCashToCashbox,
  removeCashFromCashbox,
} from "../api/OrganizationService";
import { AiFillCloseCircle } from "react-icons/ai";

function Cash() {
  const [orderData, setOrderData] = useState({});
  const [cashbox, setCashbox] = useState({});
  const [orderDataLoading, setOrderDataLoading] = useState(false);
  const [goods, setGoods] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [groups, setGroups] = useState([]);
  const [managers, setManagers] = useState([]);
  const [goodsForSell, setGoodsForSell] = useState([]);
  const [payment, setPayment] = useState([]);
  const [search, setSearch] = useState("");
  const [returnId, setReturnId] = useState("");
  const [controlCashAmount, setControlCashAmount] = useState("0");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [manager, setManager] = useState(-1);
  const [selectedGroup, setSelectedGroup] = useState({});
  const [goodsVisible, setGoodsVisible] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [cashboxLoading, setCashboxLoading] = useState(true);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [managersLoading, setManagersLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState(false);
  const [setAsideModal, setSetAsideModal] = useState(false);
  const [returnModal, setReturnModal] = useState(false);
  const [cashBoxModal, setCashBoxModal] = useState(false);
  const [controlCashModal, setControlCashModal] = useState(false);
  const [printCheck, setPrintCheck] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState();
  const [nowEditing, setNowEditing] = useState(null);
  const navigate = useNavigate();
  const { alert, setFixed } = useAuth();
  const [discount, setDiscount] = useState({ amount: 0, type: "KZT" });

  const buttons = [
    {
      disabled: processLoading,
      icon: <BiLock />,
      text: "Моя смена",
      onClick: () => setCashBoxModal(true),
    },
    {
      disabled: processLoading,
      icon: <BiSad />,
      text: "Возврат по чеку",
      onClick: () => setReturnModal(true),
    },
    {
      disabled: processLoading,
      icon: <BsCashCoin />,
      text: "Контроль налички",
      onClick: () => setControlCashModal(true),
    },
  ];

  const statusesRussian = useMemo(() => {
    return {
      processing: "На обработке",
      awaiting: "Ожидает выдачи",
      returned: "Возвращен",
      cancelled: "Отменен",
      finished: "Завершен",
    };
  }, []);

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

  const filteredOrders = useMemo(() => {
    const temp = orders.filter((order) => {
      return order.countable === 1;
    });
    return temp;
  }, [orders]);

  const sortedOrders = useMemo(() => {
    try {
      const temp = [...filteredOrders].sort((a, b) => {
        let result = 0;
        if (moment(a.creationdate) < moment(b.creationdate)) {
          result = 1;
        }
        if (moment(a.creationdate) > moment(b.creationdate)) {
          result = -1;
        }
        return result;
      });
      return temp;
    } catch (e) {
      console.log("Sort Error:", e);
      return [];
    }
  }, [filteredOrders]);

  useEffect(() => {
    getOrgInfo({
      setData: () => {},
      setFetchLoading: setPaymentsLoading,
      setValue: (key, value) => {
        if (key === "paymentMethods") {
          setPaymentMethods(value);
        }
      },
    });
    getCashbox({ setCashboxLoading, setCashbox });
    getManagers({ setManagers, setManagersLoading });
    getOrders({ setOrdersLoading, setOrders, status: "pickup" });
  }, []);

  useEffect(() => {
    getGoodsAndGroups({ setFetchLoading, setGoods, setGroups, next: () => {} });
    const interval = setInterval(() => {
      getGoodsAndGroups({
        setFetchLoading,
        setGoods,
        setGroups,
        next: () => {},
      });
    }, 300000);
    return () => clearInterval(interval);
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
    if (window.innerHeight < 300 || window.innerWidth < 900) {
      setFixed(false);
      return;
    }
    setFixed(true);
  }, [setFixed]);

  useEffect(() => {
    if (!orderData) {
      return;
    }
    if (Object.keys(orderData).length === 0) {
      return;
    }
    setManager(orderData.authorId);
    setGoodsForSell(
      orderData.goods.map((item) => {
        return {
          discount: item.discount,
          id: item.id,
          price: item.price,
          purchase: item.purchase,
          quantity: item.quantity,
          remainder: item.remainder,
          name: item.name,
        };
      })
    );
    setPayment(orderData.payment);
    setDiscount(orderData.discount);
  }, [orderData]);

  useEffect(() => {
    if (!nowEditing) {
      return;
    }
    getOrderDetails({
      id: nowEditing,
      setData: setOrderData,
      setFetchLoading: setOrderDataLoading,
      next: () => {
        setSetAsideModal(false);
      },
    });
  }, [nowEditing]);

  const handleDiscountChange = (value) => {
    const temp = { ...discount };
    const parsedValue = parseInt(value);
    const result = isNaN(parsedValue) ? 0 : parsedValue;
    temp.amount = result;
    setDiscount(temp);
  };

  const newGood = useCallback(
    (good) => {
      if (good.remainder <= 0) {
        alert("Ошибка", "Товара нет в наличии.");
        return;
      }
      const temp = [...goodsForSell];
      for (let item of temp) {
        if (item.id === good.id) {
          if (item.quantity + 1 > item.remainder) {
            return;
          }
          item.quantity = parseInt(item.quantity) + 1;
          return;
        }
      }
      temp.push(good);
      setGoodsForSell(temp);
    },
    [goodsForSell, alert]
  );

  const newPayment = useCallback((paymentItem) => {
    setPayment((payment) => {
      const temp = [...payment];
      let biggestId = 0;
      temp.forEach((item) => {
        if (item.id > biggestId) {
          biggestId = item.id;
        }
      });
      temp.push({ id: biggestId + 1, ...paymentItem });
      return temp;
    });
  }, []);

  const setPaymentSum = (v, focus) => {
    setPayment((payment) => {
      const temp = [...payment];
      for (let item of temp) {
        if (focus === item.id) {
          const prev = item.sum + "";
          if (v === "Backspace") {
            const backspacedSum = prev.substring(0, prev.length - 1);
            if (backspacedSum === "") {
              item.sum = "0";
            } else {
              item.sum = backspacedSum;
            }
            break;
          }
          if (v === "Enter") {
            break;
          }
          const prev2 = prev === "0" ? v : prev + v;
          const result = parseInt(
            prev2.replace(/^0{2,}|^0.|[^0-9/]/gim, "").substring(0, 7)
          );
          const result2 = isNaN(result) ? 0 : result;
          item.sum = result2;
        }
      }
      return temp;
    });
  };

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
                price: item.price,
                purchase: item.purchase,
                quantity: 1,
                discount: { amount: 0, type: "KZT" },
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
  }, [barcodeInput, goods, fetchLoading, newGood]);

  const sum = useMemo(() => {
    try {
      let tempSum = 0;
      goodsForSell.forEach(
        (good) =>
          (tempSum +=
            good.quantity * good.price -
            (good.discount.type === "percent"
              ? ((good.price * good.discount.amount) / 100) * good.quantity
              : good.discount.amount * good.quantity))
      );
      return tempSum;
    } catch (e) {
      console.log(e);
      return 0;
    }
  }, [goodsForSell]);

  const cashSum = useMemo(() => {
    try {
      if (cashboxLoading) {
        return 0;
      }
      const remove = "remove";
      let tempSum = 0;
      cashbox.cash.forEach((item) => {
        if (item.type === remove) {
          tempSum -= item.amount;
          return;
        }
        tempSum += item.amount;
      });
      return tempSum;
    } catch (e) {
      console.log("Cashbox Sum Error:", e);
      return 0;
    }
  }, [cashbox, cashboxLoading]);

  const sumWithDiscount = useMemo(() => {
    try {
      let tempSum =
        sum -
        (discount.type === "percent"
          ? (sum * discount.amount) / 100
          : discount.amount);
      return tempSum;
    } catch (e) {
      console.log(e);
      return 0;
    }
  }, [sum, discount]);

  const paymentSum = useMemo(() => {
    try {
      let tempSum = 0;
      payment.forEach((item) => {
        tempSum += isNaN(parseInt(item.sum)) ? 0 : parseInt(item.sum);
      });
      return tempSum;
    } catch (e) {
      console.log(e);
      return 0;
    }
  }, [payment]);

  const difference = useMemo(() => {
    try {
      let tempSum = paymentSum - sumWithDiscount;
      return tempSum;
    } catch (e) {
      console.log(e);
      return 0;
    }
  }, [sumWithDiscount, paymentSum]);

  const orderTotalInfo = [
    { name: "sum", title: "Подытог", type: "text", value: sum },
    { name: "discount", title: "Скидка", type: "input" },
    {
      name: "sumWithDiscount",
      title: "Итого к оплате",
      type: "text",
      value: sumWithDiscount,
    },
    {
      name: "paymentSum",
      title: "Всего оплачено",
      type: "text",
      value: paymentSum,
    },
    {
      name: "difference",
      title: "Остаток долга",
      type: "text",
      value: difference,
    },
  ];

  const buttons2 = [
    {
      disabled: processLoading,
      icon: <BiMinusCircle />,
      text: "Отмена",
      color: "#FF7373",
      onClick: () => {
        if (window.confirm("Вы действительно хотите отменить эту продажу?")) {
          if (nowEditing) {
            cancelOrder({
              id: nowEditing,
              setProcessLoading,
              cause: "Отмена кассира.",
              next: () => {
                navigate(0);
              },
            });
          } else {
            setDiscount({ amount: 0, type: "KZT" });
            setGoodsForSell([]);
            setPayment([]);
            setNowEditing(null);
          }
        }
      },
    },
    {
      disabled: processLoading || ordersLoading,
      icon: <BiArrowToRight />,
      color: "#FFD140",
      text: "Отложка",
      onClick: () => setSetAsideModal(true),
    },
    {
      disabled: processLoading || paymentsLoading,
      icon: <BiMoney />,
      color: "#4671D5",
      text: "Принять оплату",
      onClick: () => setPaymentModal(true),
    },
    {
      disabled:
        goodsForSell.length === 0 ||
        difference !== 0 ||
        processLoading ||
        updateLoading,
      icon: <BiCheckCircle />,
      text: "Продать",
      color: "#39E639",
      onClick: async () => {
        if (nowEditing) {
          issueCash({
            order: {
              goods: goodsForSell,
              manager,
              delivery: {},
              payment,
              countable: true,
              discount,
              comment: "",
            },
            setProcessLoading,
            payment: [],
            id: nowEditing,
            next: () => {
              setGoodsForSell([]);
              setUpdateLoading(true);
              navigate(0);
            },
          });
        } else {
          cashOrder({
            setProcessLoading,
            order: {
              goods: goodsForSell,
              manager,
              delivery: {},
              payment,
              countable: true,
              discount,
              comment: "",
              date: new Date(),
              cashier: localStorage.getItem("id"),
            },
            next: () => {
              setGoodsForSell([]);
              setUpdateLoading(true);
              navigate(0);
            },
          });
        }
      },
    },
  ];

  const buttons3 = [
    {
      disabled: processLoading,
      icon: <BiPlusCircle />,
      text: "Добавить оплату",
      onClick: () => {
        newPayment({
          sum: difference > 0 ? 0 : -difference,
          method: "cash",
        });
      },
    },
    {
      disabled: processLoading || difference !== 0,
      icon: <BiCheckCircle />,
      text: "Сохранить",
      onClick: () => {
        setPaymentModal(false);
      },
    },
  ];
  const buttons4 = [
    {
      disabled: processLoading || orderDataLoading,
      icon: <BiCheckCircle />,
      text:
        nowEditing && !orderDataLoading
          ? "Сохранить текущую и открыть новую продажу"
          : "Отложить текущую и открыть новую продажу",
      onClick: () => {
        if (nowEditing) {
          editOrder({
            order: {
              goods: goodsForSell,
              manager,
              delivery: {},
              payment,
              countable: true,
              discount,
              comment: "",
            },
            setEditLoading: setProcessLoading,
            id: nowEditing,
            next: () => {
              navigate(0);
            },
          });
        } else {
          newOrder({
            setNewOrderLoading: setProcessLoading,
            order: {
              goods: goodsForSell,
              manager,
              delivery: {},
              payment,
              countable: true,
              discount,
              comment: "",
              date: new Date(),
              cashier: localStorage.getItem("id"),
            },
            next: () => {
              navigate(0);
            },
          });
        }
      },
    },
  ];

  const handleControlCashAmount = useCallback((value) => {
    const parsedValue = parseInt(value);
    const isNaNControl = isNaN(parsedValue) ? 0 : parsedValue;
    const negativeControl = Math.abs(isNaNControl);
    setControlCashAmount(negativeControl);
  }, []);

  if (window.innerHeight < 300 || window.innerWidth < 900) {
    return (
      <div className="pageWrapper" style={{ justifyContent: "flex-start" }}>
        <div className={cl.Options}></div>
        <div
          style={{
            height: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ textAlign: "center" }}>
            Касса недоступна на телефонах. Пожалуйста, зайдите с компьютера.
          </p>
        </div>
      </div>
    );
  }

  if (cashboxLoading) {
    return (
      <div className="pageWrapper" style={{ justifyContent: "flex-start" }}>
        <div className={cl.Options}></div>
        <div
          style={{
            height: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loading />
        </div>
      </div>
    );
  }

  if (Object.keys(cashbox).length === 0) {
    return (
      <div className="pageWrapper" style={{ justifyContent: "flex-start" }}>
        <div className={cl.Options}></div>
        <div
          style={{
            height: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: 40,
              textAlign: "center",
            }}
          >
            <p style={{ fontWeight: "bold", color: "#757575" }}>
              Открыть новую смену за
            </p>
            <p style={{ fontWeight: "bold", color: "#757575" }}>
              {localStorage.getItem("name")}, ID: {localStorage.getItem("id")}
            </p>
          </div>
          <Button
            icon={<BiLockOpen />}
            disabled={processLoading}
            text="Открыть новую кассу"
            onClick={() => {
              openCashbox({
                setCashboxLoading,
                next: () => {
                  navigate(0);
                },
              });
            }}
          />
          <Button
            style={{ marginTop: 10 }}
            icon={<BiLock />}
            disabled={processLoading}
            text="Закрыть текущую открытую кассу"
            onClick={() => {
              closeAnyCashbox({
                setProcessLoading: setCashboxLoading,
                next: () => {},
              });
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pageWrapper">
      <ScreenFixer />
      <div className={cl.Options}>
        <div className={cl.OptionsButtons}>
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
          {nowEditing ? (
            <p style={{ color: "#d7a938", fontSize: 12 }}>
              Сейчас редактируется: # {nowEditing}
            </p>
          ) : (
            ""
          )}
        </div>
        <div className={cl.OptionsButtons}>
          {buttons2.map((button) => {
            return (
              <button
                style={{
                  backgroundColor: button.color,
                }}
                disabled={button.disabled}
                key={button.text}
                onClick={button.onClick}
                className={cl.CashButton}
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
          style={{ width: "40%", minWidth: "40%" }}
        >
          <div style={{ padding: "0 15px" }}>
            <SearchInput
              value={search}
              setValue={setSearch}
              placeholder="Поиск товара"
            />
          </div>
          {fetchLoading ? (
            <div className={cl.Center}>
              <Loading which="gray" />
            </div>
          ) : (
            <div
              style={{
                maxHeight: 500,
                height: 500,
                minHeight: 500,
                overflow: "auto",
                marginTop: 20,
              }}
            >
              {!goodsVisible ? (
                <div
                  style={{
                    margin: "0 15px",
                    backgroundColor: "#f8f8f8",
                    borderRadius: 5,
                    overflow: "hidden",
                    userSelect: "none",
                  }}
                >
                  <div
                    onClick={() => {
                      setSelectedGroup({
                        id: -1,
                        name: "Товары без группы",
                      });
                      setGoodsVisible(true);
                    }}
                    style={{
                      minHeight: 50,
                      maxHeight: 50,
                      height: 50,
                      display: "flex",
                      alignItems: "center",
                      padding: 5,
                      borderBottom: "1px solid #989898",
                    }}
                  >
                    Товары без группы
                  </div>
                  {groups.map((group) => {
                    return (
                      <div
                        key={group.id}
                        onClick={() => {
                          setSelectedGroup({
                            id: group.id,
                            name: group.name,
                          });
                          setGoodsVisible(true);
                        }}
                        style={{
                          minHeight: 50,
                          maxHeight: 50,
                          height: 50,
                          display: "flex",
                          alignItems: "center",
                          padding: 5,
                          borderBottom: "1px solid #989898",
                        }}
                      >
                        {group.name}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    margin: "0 15px",
                    backgroundColor: "#f8f8f8",
                    borderRadius: 5,
                    overflow: "hidden",
                    userSelect: "none",
                  }}
                >
                  <div
                    onClick={() => {
                      setSelectedGroup({});
                      setGoodsVisible(false);
                      setSearch("");
                    }}
                    style={{
                      minHeight: 50,
                      maxHeight: 50,
                      height: 50,
                      display: "flex",
                      alignItems: "center",
                      padding: 5,
                      borderBottom: "1px solid #989898",
                      backgroundColor: "#f2f2f2",
                    }}
                  >
                    <BsArrowLeftCircle />
                    <p style={{ marginLeft: 5 }}>Назад</p>
                  </div>
                  {filteredGoods.map((good) => {
                    return (
                      <div
                        key={good.id}
                        onClick={() => {
                          newGood({
                            id: good.id,
                            name: good.name,
                            price: good.price,
                            purchase: good.purchase,
                            quantity: 1,
                            discount: { amount: 0, type: "KZT" },
                            remainder: good.remainder,
                          });
                        }}
                        style={{
                          minHeight: 50,
                          maxHeight: 50,
                          height: 50,
                          display: "flex",
                          alignItems: "center",
                          padding: 5,
                          borderBottom: "1px solid #989898",
                        }}
                      >
                        {good.name} ({good.remainder}
                        {good.unit})
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        <div className={cl.secondHalf}>
          <div className={cl.inputsMobile}></div>
          <div
            className={cl.tableWrapper}
            style={{
              maxHeight: 280,
              backgroundColor: "#dedede",
              borderRadius: 5,
            }}
          >
            <table style={{ backgroundColor: "#f8f8f8" }}>
              <thead style={{ position: "sticky", top: "-1px", zIndex: 25 }}>
                <NoGoodHeaders />
              </thead>
              {goodsForSell.length === 0 ? (
                <tbody style={{ width: "100%", textAlign: "center" }}>
                  <tr>
                    <td colSpan={10}>Ничего не найдено</td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {goodsForSell.map((good, index) => {
                    return (
                      <NoGoodRow
                        key={good.id}
                        good={good}
                        index={index + 1}
                        setGoods={setGoodsForSell}
                        goods={goodsForSell}
                      />
                    );
                  })}
                </tbody>
              )}
            </table>
          </div>
          <div
            style={{
              color: "#303030",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              maxWidth: "74%",
            }}
          >
            <p
              style={{
                fontWeight: "bold",
                textTransform: "uppercase",
                marginRight: 10,
                fontSize: 13,
                width: 150,
                minWidth: 150,
              }}
            >
              Менеджер:
            </p>
            <Select
              value={manager}
              options={managers}
              loading={managersLoading || processLoading}
              setValue={setManager}
              type={"managers"}
              style={{ margin: "10px 0" }}
            />
          </div>
          <div>
            {orderTotalInfo.map((item) => {
              return (
                <div
                  key={item.name}
                  style={{
                    color: "#303030",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    margin: "6px 0",
                  }}
                >
                  <p
                    style={{
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      marginRight: 10,
                      fontSize: 13,
                      width: 150,
                      minWidth: 150,
                    }}
                  >
                    {item.title}:
                  </p>
                  {item.type === "input" ? (
                    <div
                      style={{
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        fontSize: 13,
                        width: "50%",
                        minWidth: 200,
                        paddingRight: 15,
                        justifyContent: "flex-end",
                        display: "flex",
                        flexDirection: "row",
                      }}
                    >
                      <input
                        autoComplete="new-password"
                        onChange={({ target }) =>
                          handleDiscountChange(target.value)
                        }
                        value={discount.amount}
                        type="text"
                        style={{ textAlign: "end", padding: "1px 3px" }}
                      />
                      <select
                        value={discount.type}
                        onChange={(e) => {
                          const temp = { ...discount };
                          temp.type = e.target.value;
                          setDiscount(temp);
                        }}
                      >
                        <option value="percent">%</option>
                        <option value="KZT">тг</option>
                      </select>
                    </div>
                  ) : (
                    <p
                      style={{
                        fontSize: 13,
                        width: "50%",
                        minWidth: 200,
                        textAlign: "end",
                        paddingRight: 15,
                        color:
                          item.name === "difference"
                            ? item.value !== 0
                              ? "red"
                              : "green"
                            : "initial",
                      }}
                    >
                      {item.value} тг
                    </p>
                  )}
                </div>
              );
            })}
            <div
              style={{
                color: "#303030",
                display: "flex",
                alignItems: "center",
                minWidth: 300,
                width: "75%",
                maxWidth: 500,
                justifyContent: "space-between",
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  paddingRight: 15,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                Печатать чек
              </p>
              <CheckBox
                checked={printCheck}
                onChange={(e) => setPrintCheck(e.target.checked)}
              />
            </div>
          </div>
        </div>
      </div>
      <Modal
        noEscape={processLoading}
        modalVisible={paymentModal}
        setModalVisible={setPaymentModal}
      >
        <div style={{ display: "flex" }}>
          <div>
            <p>Добавьте оплату</p>
            <p>Общая сумма: {sumWithDiscount}тг</p>
            <p>Уже оплачено: {paymentSum}тг</p>
            <p>Осталось к оплате: {-difference}тг</p>
            <div
              className={cl.tableWrapper}
              style={{
                height: "inherit",
                margin: "20px 0",
                minWidth: 500,
                maxHeight: 300,
                overflow: "auto",
              }}
            >
              <table>
                <thead>
                  <NoPaymentHeaders />
                </thead>
                {payment.length === 0 ? (
                  <tbody
                    style={{
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    <tr>
                      <td colSpan={10}>Нет оплаты</td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {payment.map((item, index) => {
                      return (
                        <NoPaymentRow
                          key={item.id}
                          setPayment={setPayment}
                          payment={payment}
                          editable={true || !processLoading || item.editable}
                          index={index + 1}
                          paymentItem={item}
                          setFocusedInput={setFocusedInput}
                          paymentMethods={paymentMethods}
                        />
                      );
                    })}
                  </tbody>
                )}
              </table>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {buttons3.map((button) => {
                return (
                  <button
                    disabled={button.disabled}
                    key={button.text}
                    onClick={button.onClick}
                    className={cl.OptionsButton}
                    style={{ marginBottom: 5, minHeight: 50 }}
                  >
                    {button.icon}
                    {button.text}
                  </button>
                );
              })}
            </div>
          </div>
          <div
            style={{
              minWidth: 300,
              maxWidth: 300,
              width: 300,
              marginLeft: 20,
              backgroundColor: "#dedede",
              borderRadius: 5,
            }}
          >
            <NumKeyBoard
              setValue={setPaymentSum}
              focusedInput={focusedInput}
              onEnter={() => setPaymentModal(false)}
            />
          </div>
        </div>
      </Modal>
      <Modal
        noEscape={processLoading || orderDataLoading}
        setModalVisible={setSetAsideModal}
        modalVisible={setAsideModal}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 15,
          }}
        >
          <p>Отложенные продажи</p>
          {buttons4.map((button) => {
            return (
              <button
                disabled={button.disabled}
                key={button.text}
                onClick={button.onClick}
                className={cl.OptionsButton}
                style={{ marginBottom: 5, minHeight: 50 }}
              >
                {button.icon}
                {button.text}
              </button>
            );
          })}
        </div>
        <div
          className={cl.tableWrapper}
          style={{
            height: "inherit",
            maxHeight: 500,
            minHeight: 500,
            minWidth: 800,
            maxWidth: 800,
          }}
        >
          {orderDataLoading ? (
            <div className={cl.Center}>
              <Loading />
            </div>
          ) : (
            <table>
              <thead>
                <OrderHeadersPickup />
              </thead>
              <tbody>
                {sortedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={1000 - 7}>
                      Не найдено заказов по данным критериам
                    </td>
                  </tr>
                ) : (
                  sortedOrders.map((order) => {
                    return (
                      <OrderPickup
                        key={order.id}
                        handleMark={() => {}}
                        order={order}
                        orderStatus={
                          <div>
                            <p style={{ fontSize: 12 }}>
                              {statusesRussian[order.status]}
                            </p>
                            {order.id === nowEditing ? (
                              <p style={{ color: "#d7a938", fontSize: 12 }}>
                                Сейчас редактируется
                              </p>
                            ) : (
                              <button
                                style={{
                                  margin: 3,
                                  backgroundColor: "#12d955",
                                  padding: 5,
                                  border: "none",
                                  borderRadius: 5,
                                  color: "#f8f8f8",
                                  cursor: "pointer",
                                }}
                                disabled={orderDataLoading || processLoading}
                                onClick={() => {
                                  setNowEditing(order.id);
                                }}
                              >
                                Выбрать
                              </button>
                            )}
                          </div>
                        }
                      />
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </Modal>
      <Modal
        noEscape={processLoading}
        setModalVisible={setReturnModal}
        modalVisible={returnModal}
      >
        <p style={{ marginBottom: 20 }}>Введите номер чека:</p>
        <LegendInput
          value={returnId}
          setValue={setReturnId}
          legend="Номер чека"
          disabled={processLoading}
        />
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            margin: 10,
          }}
        >
          <Button
            disabled={processLoading}
            text="Найти чек"
            onClick={() => {
              isThereOrder({
                id: returnId,
                setProcessLoading,
                next: () => navigate("/orders/details/" + returnId),
              });
            }}
            icon={<BiSearch />}
          />
        </div>
      </Modal>
      <Modal
        noEscape={processLoading}
        setModalVisible={setCashBoxModal}
        modalVisible={cashBoxModal}
      >
        <p style={{ marginBottom: 20 }}>Информация о смене</p>
        <p>ID: {cashbox?.id}</p>
        <p>
          Дата открытия:{" "}
          {moment(cashbox?.openeddate).format("HH:mm DD.MM.yyyy")}
        </p>
        <p>Наличка: {cashSum} тг</p>
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            margin: 10,
          }}
        >
          <Button
            disabled={processLoading}
            text="Закрыть смену"
            onClick={() => {
              if (window.confirm("Вы уверены что хотите закрыть эту смену?")) {
                closeCashbox({
                  setProcessLoading,
                  cashboxId: cashbox.id,
                  next: () => {
                    navigate(0);
                  },
                });
              }
            }}
            icon={<AiFillCloseCircle />}
          />
        </div>
      </Modal>
      <Modal
        noEscape={processLoading}
        setModalVisible={setControlCashModal}
        modalVisible={controlCashModal}
      >
        <p style={{ marginBottom: 20 }}>Добавить или снять наличные</p>
        <p>ID: {cashbox?.id}</p>
        <p>Наличка: {cashSum} тг</p>
        <LegendInput
          disabled={processLoading}
          type="text"
          legend="Сумма"
          value={controlCashAmount}
          setValue={(v) => {
            handleControlCashAmount(v);
          }}
          inputMode="numeric"
        />
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            margin: "10px 0",
          }}
        >
          <Button
            style={{ minWidth: 100, maxWidth: 100, width: 100 }}
            disabled={processLoading}
            text="Доб. нал."
            onClick={() => {
              if (window.confirm("Подтвердите действие: Добавление наличных")) {
                addCashToCashbox({
                  setProcessLoading,
                  amount: controlCashAmount,
                  next: () => {
                    getCashbox({ setCashboxLoading, setCashbox });
                    setControlCashModal(false);
                    setControlCashAmount("0");
                  },
                });
              }
            }}
            icon={<BiDownArrow />}
          />
          <Button
            style={{ minWidth: 100, maxWidth: 100, width: 100 }}
            disabled={processLoading}
            text="Снять нал."
            onClick={() => {
              if (window.confirm("Подтвердите действие: Снятие наличных")) {
                removeCashFromCashbox({
                  setProcessLoading,
                  amount: controlCashAmount,
                  next: () => {
                    getCashbox({ setCashboxLoading, setCashbox });
                    setControlCashModal(false);
                    setControlCashAmount("0");
                  },
                });
              }
            }}
            icon={<BiUpArrow />}
          />
        </div>
      </Modal>
    </div>
  );
}

export default Cash;
