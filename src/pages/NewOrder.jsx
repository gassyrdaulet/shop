import cl from "../styles/Goods.module.css";
import { BsArrowLeftCircle, BsPlusCircle, BsTrash } from "react-icons/bs";
import { BiChevronLeftCircle } from "react-icons/bi";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import LegendInput from "../components/LegendInput";
import SearchInput from "../components/SearchInput";
import Select from "../components/Select";
import NoGoodHeaders from "../components/NoGoodHeaders";
import NoGoodRow from "../components/NoGoodRow";
import { useState, useMemo, useEffect, useCallback } from "react";
import moment from "moment";
import Modal from "../components/Modal";
import { getGoodsAndGroups } from "../api/GoodService";
import NoPaymentHeaders from "../components/NoPaymentHeaders";
import NoPaymentRow from "../components/NoPaymentRow";
import useAuth from "../hooks/useAuth";
import CheckBox from "../components/CheckBox";
import { getManagers, getOrgInfo } from "../api/OrganizationService";
import { newOrder } from "../api/OrderService";

function NewOrder() {
  const [newOrderLoading, setNewOrderLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [addGoodModal, setAddGoodModal] = useState(false);
  const [deliveryModal, setDeliveryModal] = useState(false);
  const [countable, setCountable] = useState(true);
  const [comment, setComment] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [managers, setManagers] = useState([]);
  const [fetchedGoods, setFetchedGoods] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState();
  const [fetchedGroups, setFetchedGroups] = useState([]);
  const [goodsVisible, setGoodsVisible] = useState(false);
  const [goods, setGoods] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [payment, setPayment] = useState([]);
  const [delivery, setDelivery] = useState({});
  const [discount, setDiscount] = useState({ amount: 0, type: "KZT" });
  const [manager, setManager] = useState(localStorage.getItem("id"));
  const [selectedTab, setSelectedTab] = useState("goods");
  const [managersLoading, setManagersLoading] = useState(false);
  const [date, setDate] = useState(moment().format("yyyy-MM-DD"));
  const navigate = useNavigate();
  const { alert } = useAuth();
  const [deliveryInputs, setDeliveryInputs] = useState([
    {
      title: "Номер телефона",
      type: "text",
      inputMode: "tel",
      value: "",
      name: "cellphone",
    },
    {
      title: "Адрес",
      type: "text",
      inputMode: "text",
      value: "",
      name: "address",
    },
    {
      title: "Стоимость доставки для клиента",
      type: "text",
      inputMode: "numeric",
      value: "0",
      name: "deliveryPriceForCustomer",
    },
    {
      title: "Зарплата курьера",
      type: "text",
      inputMode: "numeric",
      value: "0",
      name: "deliveryPriceForDeliver",
    },
    {
      title: "Дата доставки",
      type: "date",
      inputMode: "numeric",
      value: moment().format("yyyy-MM-DD"),
      name: "plannedDeliveryDate",
    },
  ]);

  const buttons = [
    {
      disabled: newOrderLoading,
      icon: <BsArrowLeftCircle />,
      text: "Назад",
      onClick: () => navigate(-1),
    },
  ];
  const buttons2 = [
    {
      disabled: newOrderLoading,
      icon: <AiOutlineCheckCircle />,
      text: "Сохранить",
      onClick: () => {
        newOrder({
          order: {
            goods,
            manager,
            delivery,
            payment,
            countable,
            discount,
            comment,
            date,
          },
          setNewOrderLoading,
          next: () => {
            navigate(Object.keys(delivery).length === 0 ? -1 : "/delivery/new");
          },
        });
      },
    },
  ];
  const buttons3 = [
    {
      disabled: newOrderLoading || fetchLoading,
      icon: <BsPlusCircle />,
      text: "Добавить товар",
      onClick: () => {
        setAddGoodModal(true);
      },
    },
  ];
  const buttons4 = [
    {
      disabled: newOrderLoading || paymentsLoading,
      icon: <BsPlusCircle />,
      text: "Добавить оплату",
      onClick: () => {
        newPayment({ sum: difference > 0 ? 0 : -difference, method: "cash" });
      },
    },
  ];
  const buttons5 = [
    {
      disabled: newOrderLoading,
      icon: <BsPlusCircle />,
      text:
        Object.keys(delivery).length === 0
          ? "Оформить доставку"
          : "Редактировать доставку",
      onClick: () => {
        setDeliveryModal(true);
      },
    },
  ];
  const buttons6 = [
    {
      disabled: newOrderLoading,
      icon: <BsTrash />,
      text: "Удалить",
      onClick: () => {
        setDelivery({});
        setDeliveryModal(false);
      },
    },
    {
      disabled: newOrderLoading,
      icon: <BsPlusCircle />,
      text: "Сохранить",
      onClick: () => {
        saveInputs();
      },
    },
  ];

  const tabs = [
    {
      text: "Список товаров",
      name: "goods",
      onClick: () => {
        setSelectedTab("goods");
      },
    },
    {
      text: "Оплата",
      name: "payment",
      onClick: () => {
        setSelectedTab("payment");
      },
    },
    {
      text: "Доставка",
      name: "delivery",
      onClick: () => {
        setSelectedTab("delivery");
      },
    },
  ];

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

  const sum = useMemo(() => {
    try {
      let tempSum = 0;
      goods.forEach(
        (good) =>
          (tempSum +=
            good.quantity * good.price -
            (good.discount.type === "percent"
              ? ((good.price * good.discount.amount) / 100) * good.quantity
              : good.discount.amount * good.quantity))
      );
      const deliveryPrice = parseInt(delivery["deliveryPriceForCustomer"]);
      tempSum += isNaN(deliveryPrice) ? 0 : deliveryPrice;
      return tempSum;
    } catch (e) {
      console.log(e);
      return 0;
    }
  }, [goods, delivery]);

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

  const newGood = useCallback(
    (good) => {
      if (good.remainder <= 0) {
        alert("Ошибка", "Товара нет в наличии.");
        return;
      }
      const temp = [...goods];
      for (let item of temp) {
        if (item.id === good.id) {
          if (item.quantity + 1 > good.remainder) {
            return;
          }
          item.quantity = parseInt(item.quantity) + 1;
          return;
        }
      }
      temp.push(good);
      setGoods(temp);
    },
    [goods, alert]
  );

  const newPayment = (paymentItem) => {
    const temp = [...payment];
    let biggestId = 0;
    temp.forEach((item) => {
      if (item.id > biggestId) {
        biggestId = item.id;
      }
    });
    temp.push({ id: biggestId + 1, ...paymentItem });
    setPayment(temp);
  };

  const saveInputs = () => {
    const body = {};
    deliveryInputs.forEach((item) => {
      if (item.name === "plannedDeliveryDate") {
        body[item.name] = moment(item.value).valueOf();
        return;
      }
      body[item.name] = item.value;
    });
    setDelivery(body);
    setDeliveryModal(false);
  };

  const handleDeliveryInputChange = (name, value) => {
    const temp = [...deliveryInputs];
    for (let item of temp) {
      if (item.name === name) {
        if (name.startsWith("deliveryPrice")) {
          const result = parseInt(value);
          const result2 = isNaN(result) ? 0 : result;
          const result3 = result2 < 0 ? 0 : result2;
          item.value = result3;
          break;
        }
        if (item.name === "cellphone") {
          const finalValue = value.replaceAll(" ", "");
          item.value = finalValue;
          break;
        }
        item.value = value;
        break;
      }
    }
    setDeliveryInputs(temp);
  };

  const handleDiscountChange = (value) => {
    const temp = { ...discount };
    const parsedValue = parseInt(value);
    const result = isNaN(parsedValue) ? 0 : parsedValue;
    temp.amount = result;
    setDiscount(temp);
  };

  useEffect(() => {
    getOrgInfo({
      setFetchLoading: setPaymentsLoading,
      setData: () => {},
      setValue: (key, v) => {
        if (key === "paymentMethods") {
          setPaymentMethods(v);
        }
      },
    });
    getManagers({ setManagers, setManagersLoading });
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
  }, [barcodeInput, fetchedGoods, fetchLoading, newGood]);

  return (
    <div className="pageWrapper">
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
            disabled={newOrderLoading}
            legend="Дата"
            setValue={(v) => setDate(v)}
          />
          <Select
            value={manager}
            options={managers}
            loading={managersLoading || newOrderLoading}
            setValue={setManager}
            type={"managers"}
            style={{ margin: "10px 0" }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              border: "1px solid #dedede",
              borderLeft: "none",
              borderRight: "none",
            }}
          >
            <p style={{ fontSize: 13 }}>Добавлять в отчет:</p>
            <CheckBox
              checked={countable}
              onChange={(e) => setCountable(e.target.checked)}
            />
          </div>
          <LegendInput
            type="text"
            disabled={newOrderLoading}
            value={comment}
            setValue={setComment}
            legend="Заметка"
            inputMode="text"
            textarea={true}
            inputStyle={{ minHeight: 180, width: "100%" }}
            maxLength={500}
          />
        </div>
        <div className={cl.secondHalf}>
          <div className={cl.inputsMobile}>
            <LegendInput
              type="date"
              value={date}
              legend="Дата"
              disabled={newOrderLoading}
              setValue={(v) => setDate(v)}
            />
            <Select
              value={manager}
              options={managers}
              loading={managersLoading}
              setValue={setManager}
              className={cl.Select}
              type={"managers"}
              style={{ margin: "10px 0" }}
            />
            <LegendInput
              type="text"
              value={comment}
              disabled={newOrderLoading}
              setValue={setComment}
              legend="Заметка"
              inputMode="text"
              textarea={true}
              inputStyle={{ minHeight: 90, width: "100%" }}
              maxLength={500}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                border: "1px solid #dedede",
                borderLeft: "none",
                borderRight: "none",
              }}
            >
              <p>Добавлять в отчет:</p>
              <CheckBox
                checked={countable}
                onChange={(e) => setCountable(e.target.checked)}
              />
            </div>
          </div>
          <div className={cl.newOrderInfoWrapper}>
            <div className={cl.newOrderTabs}>
              {tabs.map((tab) => (
                <div
                  key={tab.name}
                  className={
                    cl.newOrderTab +
                    " " +
                    (selectedTab === tab.name ? cl.activeTab : "")
                  }
                  onClick={tab.onClick}
                >
                  {tab.text}
                </div>
              ))}
            </div>
            <div
              className={
                cl.newOrderTabPanel +
                " " +
                (selectedTab === "goods" ? cl.activeTabPanel : "")
              }
            >
              <div className={cl.tableWrapper} style={{ height: "inherit" }}>
                <table>
                  <thead>
                    <NoGoodHeaders />
                  </thead>
                  {goods.length === 0 ? (
                    <tbody style={{ width: "100%", textAlign: "center" }}>
                      <tr>
                        <td colSpan={10}>Товары не выбраны</td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {goods.map((good, index) => {
                        return (
                          <NoGoodRow
                            key={good.id}
                            setGoods={setGoods}
                            goods={goods}
                            editable={!newOrderLoading}
                            index={index + 1}
                            good={good}
                          />
                        );
                      })}
                    </tbody>
                  )}
                </table>
              </div>
              <div className={cl.newOrderButtons}>
                {buttons3.map((button) => {
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
            <div
              className={
                cl.newOrderTabPanel +
                " " +
                (selectedTab === "payment" ? cl.activeTabPanel : "")
              }
            >
              <div className={cl.tableWrapper} style={{ height: "inherit" }}>
                <table>
                  <thead>
                    <NoPaymentHeaders />
                  </thead>
                  {payment.length === 0 ? (
                    <tbody style={{ width: "100%", textAlign: "center" }}>
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
                            editable={!newOrderLoading}
                            index={index + 1}
                            paymentItem={item}
                            setFocusedInput={() => {}}
                            paymentMethods={paymentMethods}
                          />
                        );
                      })}
                    </tbody>
                  )}
                </table>
              </div>
              <div className={cl.newOrderButtons}>
                {buttons4.map((button) => {
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
            <div
              className={
                cl.newOrderTabPanel +
                " " +
                (selectedTab === "delivery" ? cl.activeTabPanel : "")
              }
            >
              {Object.keys(delivery).length === 0 ? (
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100px",
                    userSelect: "none",
                  }}
                >
                  <p>Самовывоз</p>
                </div>
              ) : (
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    padding: 15,
                  }}
                >
                  {deliveryInputs.map((item) => {
                    return (
                      <div key={item.name}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            margin: "5px 0",
                            alignItems: "center",
                            color: "#303030",
                          }}
                        >
                          <p
                            style={{
                              fontWeight: "bold",
                              width: 140,
                              minWidth: 140,
                              textTransform: "uppercase",
                              fontSize: 13,
                            }}
                          >
                            {item.title}
                          </p>
                          <p
                            style={{
                              fontWeight: "bold",
                              width: 5,
                              minWidth: 5,
                              textTransform: "uppercase",
                              marginRight: 15,
                              fontSize: 13,
                            }}
                          >
                            :
                          </p>
                          <p style={{ fontSize: 13 }}>
                            {item.name === "plannedDeliveryDate"
                              ? moment(delivery[item.name]).format("DD.MM.yyyy")
                              : delivery[item.name]}
                          </p>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "1px",
                            backgroundColor: "#a0a0a0",
                            marginBottom: "5px",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
              <div className={cl.newOrderButtons}>
                {buttons5.map((button) => {
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
          </div>
          <div style={{ marginTop: 15 }}>
            {orderTotalInfo.map((item) => {
              return (
                <div
                  key={item.name}
                  style={{
                    color: "#303030",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
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
              <p className={cl.NavigationGroupName}>{selectedGroup?.name}</p>
              <SearchInput
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
                          price: good.price,
                          purchase: good.purchase,
                          quantity: 1,
                          discount: { amount: 0, type: "KZT" },
                          remainder: good.remainder,
                        });
                        setSelectedGroup({});
                        setGoodsVisible(false);
                        setSearch("");
                        setAddGoodModal(false);
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
      <Modal
        setModalVisible={(v) => {
          setDeliveryModal(v);
          saveInputs();
        }}
        modalVisible={deliveryModal}
      >
        <div className={cl.AddGood} style={{ justifyContent: "flex-start" }}>
          <p>Оформление доставки</p>
          <div style={{ margin: "30px 0 20px 0" }}>
            {deliveryInputs.map((input) => {
              return (
                <LegendInput
                  key={input.name}
                  type={input.type}
                  legend={input.title}
                  inputMode={input.inputMode}
                  disabled={newOrderLoading}
                  value={input.value}
                  setValue={(v) => {
                    handleDeliveryInputChange(input.name, v);
                  }}
                />
              );
            })}
          </div>
          <div className={cl.newOrderButtons}>
            {buttons6.map((button) => {
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
      </Modal>
    </div>
  );
}

export default NewOrder;
