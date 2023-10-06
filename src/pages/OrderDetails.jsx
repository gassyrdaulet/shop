import { useState, useEffect, useMemo } from "react";
import { BsArrowLeftCircle, BsPencil } from "react-icons/bs";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { useNavigate, useParams } from "react-router-dom";
import cl from "../styles/Goods.module.css";
import {
  getOrderDetails,
  sendDeliver,
  issueOrder,
  finishOrder,
  cancelOrder,
  recreateOrder,
  returnOrder,
  issuePickup,
  sendKaspiCode,
  editOrderManager,
} from "../api/OrderService";
import Loading from "../components/Loading";
import moment from "moment/moment";
import InfoRow from "../components/InfoRow";
import Modal from "../components/Modal";
import LegendInput from "../components/LegendInput";
import Button from "../components/Button";
import Select from "../components/Select";
import {
  getDelivers,
  getManagers,
  getOrgInfo,
} from "../api/OrganizationService";
import NoPaymentRow from "../components/NoPaymentRow";
import NoPaymentHeaders from "../components/NoPaymentHeaders";
import { BiCheckCircle, BiPlusCircle, BiUserCircle } from "react-icons/bi";
import SearchInput from "../components/SearchInput";

function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState({});
  const [fetchLoading, setFetchLoading] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);
  const [pickDeliverModal, setPickDeliverModal] = useState(false);
  const [addPaymentModal, setAddPaymentModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmPickupModal, setConfirmPickupModal] = useState(false);
  const [cause, setCause] = useState("");
  const [code, setCode] = useState("");
  const [cancelModal, setCancelModal] = useState(false);
  const [codeModal, setCodeModal] = useState(false);
  const [recreateModal, setRecreateModal] = useState(false);
  const [returnModal, setReturnModal] = useState(false);
  const [editManagerModal, setEditManagerModal] = useState(false);
  const [newManager, setNewManager] = useState(0);
  const [managersLoading, setManagersLoading] = useState(true);
  const [deliver, setDeliver] = useState(-1);
  const [delivers, setDelivers] = useState([]);
  const [fetchedPaymentMethods, setFetchedPaymentMethods] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState([]);
  const [managers, setManagers] = useState([]);
  const [deliversLoading, setDeliversLoading] = useState(false);
  const [payment, setPayment] = useState([]);

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

  useEffect(() => {
    setCause("");
  }, [cancelModal, recreateModal]);

  useEffect(() => {
    getOrderDetails({ id, setData, setFetchLoading });
  }, [id]);

  useEffect(() => {
    if (data.deliverystatus === "new") {
      getDelivers({ setDelivers, setDeliversLoading });
    }
  }, [data]);

  useEffect(() => {
    getOrgInfo({
      setData: () => {},
      setFetchLoading: setPaymentsLoading,
      setValue: (key, v) => {
        if (key === "paymentMethods") {
          setFetchedPaymentMethods(v);
        }
      },
    });
    getManagers({ setManagers, setManagersLoading });
  }, []);

  const managersWithStore = useMemo(() => {
    const temp = [...managers];
    temp.push({ id: -1, name: "Магазин" });
    return temp;
  }, [managers]);

  const orderStatuses = useMemo(() => {
    return {
      awaiting: "Ожидает выдачи",
      processing: "На обработке",
      cancelled: "Отменен",
      returned: "Возвращен",
      finished: "Завершен",
    };
  }, []);

  const deliveryStatuses = useMemo(() => {
    return {
      new: "Новый",
      awaits: "Ожидает согласия курьера",
      delivering: "На доставке",
      processing: "На обработке",
      cancelled: "Отменен",
      finished: "Завершен",
    };
  }, []);

  const actions = useMemo(() => {
    return {
      created: "СОЗДАН",
      sent: "ПРИНЯТ НА ДОСТАВКУ",
      issued: "ВЫДАН",
      cancelled: "ОТМЕНЕН",
      returned: "ОФОРМЛЕН ВОЗВРАТ",
      finished: "ЗАВЕРШЕН",
      recreated: "ПЕРЕСОЗДАН",
      refusal: "ОТКАЗ ОТ ДОСТАВКИ",
      edited: "ОТРЕДАКТИРОВАН",
    };
  }, []);

  const paymentMethods = useMemo(() => {
    const temp = {};
    for (let method of fetchedPaymentMethods) {
      temp[method.code] = method.name;
    }
    return temp;
  }, [fetchedPaymentMethods]);

  const roles = useMemo(() => {
    return {
      deliver: "Курьеру",
      manager: "Менеджеру",
      cashier: "Кассиру",
    };
  }, []);

  const plannedDeliveryDate = useMemo(() => {
    try {
      const plan = data.deliveryinfo.plannedDeliveryDate;
      if (
        data.deliverystatus === "processing" ||
        data.deliverystatus === "finished" ||
        data.deliverystatus === "cancelled" ||
        data.deliverystatus === "returned"
      ) {
        return {
          present: true,
          color: "black",
          value:
            "Запланированная дата доставки: " +
            moment(plan).format("DD.MM.yyyy"),
        };
      }
      if (data.deliverystatus === "pickup") {
        return { present: false };
      }
      const difference =
        moment().startOf("day").valueOf() -
        moment(plan).startOf("day").valueOf();
      if (difference < 0) {
        return {
          present: true,
          color: "black",
          value: moment(plan).format("DD.MM.yyyy"),
        };
      }
      if (difference >= 24 * 60 * 60 * 1000) {
        return {
          present: true,
          color: "red",
          value:
            "Вы опоздали. Запланированная дата была: " +
            moment(plan).format("DD.MM.yyyy") +
            ". Доставьте сегодня.",
        };
      }
      return {
        present: true,
        color: "green",
        value: "Доставьте сегодня. (" + moment(plan).format("DD.MM.yyyy") + ")",
      };
    } catch {
      return {
        present: false,
      };
    }
  }, [data]);

  const goodList = useMemo(() => {
    try {
      return data.goods.map((good) => {
        const damount = good?.discount?.amount;
        const dtype = good?.discount?.type;
        return (
          good.quantity +
          "шт. [" +
          good.name +
          `]` +
          ` по ${good.price}тг` +
          (damount
            ? damount === 0
              ? ""
              : ` (${damount > 0 ? `Скидка` : `Наценка`} - ${Math.abs(
                  damount
                )}${dtype === "percent" ? "%" : dtype} за шт.)`
            : "")
        );
      });
    } catch {
      return [];
    }
  }, [data]);

  const historyList = useMemo(() => {
    try {
      const result = data.history.map((item, index) => {
        return (
          index +
          1 +
          ") " +
          moment(item.date).format("DD.MM.yyyy HH:mm - ") +
          `[${actions[item.action]}] - ` +
          item.user +
          (item.cause ? ` - [Причина отмены: ${item.cause}]` : "")
        );
      });
      return result;
    } catch {
      return [];
    }
  }, [data, actions]);

  const paymentSum = useMemo(() => {
    try {
      const { payment } = data;
      let tempSum = 0;
      payment.forEach((item) => {
        tempSum += item.sum;
      });
      return tempSum;
    } catch {
      return 0;
    }
  }, [data]);

  const paymentList = useMemo(() => {
    try {
      const result = data.payment.map((item, index) => {
        const method = paymentMethods[item.method];
        const user = item.user ? roles[item.user] : "";
        return (
          index +
          1 +
          `. ${item.sum} тг [${method ? method : item.method}] ${user}`
        );
      });
      if (result.length === 0) {
        return ["0 тг"];
      }
      return [...result, "Общая оплаченная сумма: " + paymentSum + " тг"];
    } catch {
      return [];
    }
  }, [data, paymentMethods, roles, paymentSum]);

  const sum = useMemo(() => {
    try {
      const { goods, deliveryinfo: delivery } = data;
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
    } catch {
      return 0;
    }
  }, [data]);

  const sumWithDiscount = useMemo(() => {
    try {
      const { discount } = data;
      let tempSum =
        sum -
        (discount.type === "percent"
          ? (sum * discount.amount) / 100
          : discount.amount);
      return tempSum;
    } catch {
      return 0;
    }
  }, [sum, data]);

  const discount = useMemo(() => {
    try {
      const { discount } = data;
      let tempSum =
        discount.type === "percent"
          ? (sum * discount.amount) / 100
          : discount.amount;
      return tempSum === 0
        ? "0 тг"
        : tempSum +
            `тг ( - ${discount.amount}${
              discount.type === "percent" ? "%" : "тг"
            })`;
    } catch {
      return 0;
    }
  }, [sum, data]);

  const isKaspi = useMemo(() => {
    try {
      if (data?.kaspiinfo) {
        if (Object.keys(data.kaspiinfo).length !== 0) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }, [data]);

  const paymentSumLocal = useMemo(() => {
    try {
      let tempSum = 0;
      payment.forEach((item) => {
        tempSum += item.sum;
      });
      return tempSum;
    } catch {
      return 0;
    }
  }, [payment]);

  const difference = useMemo(() => {
    try {
      let tempSum = paymentSum + paymentSumLocal - sumWithDiscount;
      return tempSum;
    } catch {
      return 0;
    }
  }, [sumWithDiscount, paymentSum, paymentSumLocal]);

  const buttons = [
    {
      disabled: processLoading,
      icon: <BsArrowLeftCircle />,
      text: "Назад",
      onClick: () => navigate(-1),
    },
  ];
  const buttons2 = [
    {
      show: data.status === "awaiting",
      disabled: processLoading,
      icon: <BsPencil />,
      text: "Редактировать",
      onClick: () => {
        navigate("/orders/edit/" + id);
      },
    },
    {
      show: true,
      disabled: processLoading,
      icon: <BiUserCircle />,
      text: "Поменять продавца",
      onClick: () => {
        setEditManagerModal(true);
      },
    },
  ];
  const buttons3 = [
    {
      disabled: processLoading || deliversLoading,
      icon: <AiOutlineCheckCircle />,
      text: "Отправить",
      onClick: () => {
        sendDeliver({
          deliver,
          setProcessLoading,
          next: () => {
            setPickDeliverModal(false);
            navigate("/delivery/new");
          },
          orderIds: [id],
        });
      },
    },
  ];
  const buttons4 = [
    {
      disabled: processLoading || paymentsLoading,
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
      icon: <AiOutlineCheckCircle />,
      text: "Сохранить и подтвердить",
      onClick: () => {
        issueOrder({
          payment,
          id,
          setProcessLoading,
          next: () => {
            navigate("/delivery/delivering");
          },
        });
      },
    },
  ];
  const buttons9 = [
    {
      disabled: processLoading || paymentsLoading,
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
      icon: <AiOutlineCheckCircle />,
      text: "Сохранить и подтвердить",
      onClick: () => {
        issuePickup({
          payment,
          id,
          setProcessLoading,
          next: () => {
            navigate(-1);
          },
        });
      },
    },
  ];
  const buttons5 = [
    {
      disabled: processLoading,
      icon: <BiPlusCircle />,
      text: "Нет",
      onClick: () => {
        setConfirmModal(false);
      },
    },
    {
      disabled: processLoading,
      icon: <AiOutlineCheckCircle />,
      text: "Да",
      onClick: () => {
        finishOrder({
          deliver: data.deliverId,
          deliveryList: [
            {
              id: data.id,
              address: data.deliveryinfo.address,
              sum: sumWithDiscount,
              deliveryPay: data.deliveryinfo.deliveryPriceForDeliver,
              status: data.status,
            },
          ],
          ids: [id],
          setProcessLoading,
          next: () => {
            navigate("/delivery/processing");
          },
        });
      },
    },
  ];
  const buttons6 = [
    {
      disabled: processLoading,
      icon: <BiPlusCircle />,
      text: "Нет",
      onClick: () => {
        setCancelModal(false);
      },
    },
    {
      disabled: processLoading,
      icon: <AiOutlineCheckCircle />,
      text: "Да",
      onClick: () => {
        cancelOrder({
          id,
          cause,
          setProcessLoading,
          next: () => {
            navigate(data.delivery === 1 ? "/delivery/new" : "/pickup/new");
          },
        });
      },
    },
  ];

  const buttons7 = [
    {
      disabled: processLoading,
      icon: <BsArrowLeftCircle />,
      text: "Нет",
      onClick: () => {
        setRecreateModal(false);
      },
    },
    {
      disabled: processLoading,
      icon: <AiOutlineCheckCircle />,
      text: "Да",
      onClick: () => {
        recreateOrder({
          id,
          cause,
          setProcessLoading,
          next: () => {
            navigate("/delivery/new");
          },
        });
      },
    },
  ];
  const buttons8 = [
    {
      disabled: processLoading,
      icon: <BsArrowLeftCircle />,
      text: "Нет",
      onClick: () => {
        setReturnModal(false);
      },
    },
    {
      disabled: processLoading,
      icon: <AiOutlineCheckCircle />,
      text: "Да",
      onClick: () => {
        returnOrder({
          id,
          cause,
          setProcessLoading,
          next: () => {
            navigate(-1);
          },
        });
      },
    },
  ];

  const OrderButtons = useMemo(() => {
    try {
      return [
        {
          id: 6,
          show: data.status === "awaiting" && data.deliverystatus === "pickup",
          buttons: [
            {
              disabled: processLoading,
              text: "Подтвердить",
              name: "confirm",
              fill: "fill",
              onClick: () => {
                setConfirmPickupModal(true);
              },
            },
          ],
        },
        {
          id: -1,
          show:
            data.status === "awaiting" && data.deliverystatus === "delivering",
          buttons: [
            {
              disabled: processLoading,
              text: "Завершить",
              name: "finish",
              fill: "fill",
              onClick: () => {
                setAddPaymentModal(true);
              },
            },
          ],
        },
        {
          id: 0,
          show: data.status === "awaiting" && data.deliverystatus === "new",
          buttons: [
            {
              disabled: processLoading || deliversLoading,
              text: "Отправить",
              name: "senddeliver",
              fill: "fill",
              onClick: () => {
                setPickDeliverModal(true);
              },
            },
          ],
        },
        {
          id: 1,
          show:
            (data.status === "processing" || data.status === "cancelled") &&
            data.deliverystatus === "processing",
          buttons: [
            {
              disabled: processLoading,
              text: "Подтвердить",
              name: "confirm",
              fill: "fill",
              onClick: () => {
                setConfirmModal(true);
              },
            },
          ],
        },
        {
          id: 2,
          show: data.status === "awaiting" && isKaspi,
          buttons: [
            {
              disabled: processLoading,
              text: "Выслать код",
              name: "sendcode",
              fill: "fill",
              onClick: () => {
                sendKaspiCode({
                  order_id: data.kaspiinfo.order_id,
                  setProcessLoading,
                  managerId: data.authorId,
                  code: "",
                  confirm: false,
                });
              },
            },
            {
              disabled: processLoading,
              text: "Подтвердить код",
              name: "checkcode",
              fill: "outline",
              onClick: () => {
                setCodeModal(true);
              },
            },
          ],
        },
        {
          id: 3,
          show:
            (data.status === "awaiting" || data.status === "processing") &&
            (data.deliverystatus === "processing" ||
              data.deliverystatus === "new" ||
              data.deliverystatus === "delivering" ||
              data.deliverystatus === "pickup"),
          buttons: [
            {
              disabled: processLoading,
              text: "Отменить",
              name: "cancel",
              fill: "outline",
              onClick: () => {
                setCancelModal(true);
              },
            },
          ],
        },
        {
          id: 4,
          show:
            (data.status === "awaiting" || data.status === "processing") &&
            (data.deliverystatus === "processing" ||
              data.deliverystatus === "delivering"),
          buttons: [
            {
              disabled: processLoading,
              text: "Отказаться от доставки",
              name: "recreate",
              fill: "outline",
              onClick: () => {
                setRecreateModal(true);
              },
            },
          ],
        },
        {
          id: 5,
          show:
            data.status === "finished" &&
            (data.deliverystatus === "finished" ||
              data.deliverystatus === "pickup"),
          buttons: [
            {
              disabled: processLoading,
              text: "Оформить возврат",
              name: "return",
              fill: "outline",
              onClick: () => {
                setReturnModal(true);
              },
            },
          ],
        },
      ];
    } catch {
      return [];
    }
  }, [data, processLoading, isKaspi, deliversLoading]);

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
            if (button.show) {
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
            }
            return "";
          })}
        </div>
      </div>
      <div className={cl.goodsWrapper}>
        <div className={cl.groupsWrapper} style={{ padding: "5px" }}></div>
        <div className={cl.secondHalf} style={{ paddingBottom: 50 }}>
          <div className={cl.inputsMobile}></div>
          <p style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
            Заказ №{id}
          </p>
          {fetchLoading ? (
            <div className={cl.Center}>
              <Loading which="gray" />
            </div>
          ) : (
            <div className={cl.OrderDetails}>
              {plannedDeliveryDate.present ? (
                <p
                  style={{ color: plannedDeliveryDate.color, marginBottom: 20 }}
                >
                  {plannedDeliveryDate.value}
                </p>
              ) : (
                ""
              )}
              <p className={cl.bigCaption}>Информация о заказе</p>
              <InfoRow caption="Статус" value={orderStatuses[data.status]} />
              <InfoRow caption="Состав заказа" value={goodList} />
              <InfoRow
                caption="Сумма заказа с доставкой и со скидкой"
                value={sumWithDiscount + " тг"}
              />
              <InfoRow caption="Оплачено" value={paymentList} />
              <InfoRow caption="Менеджер" value={data.author} />
              <p style={{ margin: "20px 0 15px 0" }} className={cl.bigCaption}>
                Информация о доставке
              </p>
              {data.delivery === 1 ? (
                <div>
                  <InfoRow caption="Доставка" value="Да" />
                  <InfoRow
                    caption="Статус доставки"
                    value={deliveryStatuses[data.deliverystatus]}
                  />
                  <InfoRow caption="Курьер" value={data.deliver} />
                  <InfoRow caption="Адрес" value={data.deliveryinfo.address} />
                  <InfoRow
                    caption="Номер телефона"
                    value={data.deliveryinfo.cellphone}
                  />
                  <InfoRow
                    caption="Стоимость доставки для клиента"
                    value={data.deliveryinfo.deliveryPriceForCustomer + " тг"}
                  />
                  <InfoRow
                    caption="Зарплата курьера"
                    value={data.deliveryinfo.deliveryPriceForDeliver + " тг"}
                  />
                </div>
              ) : (
                <InfoRow caption="Доставка" value="Самовывоз" />
              )}
              <p style={{ margin: "20px 0 15px 0" }} className={cl.bigCaption}>
                Детали заказа
              </p>
              <InfoRow
                caption="Вход в отчет"
                value={
                  data.countable === 1 ? "Входит в отчет" : "Не входит в отчет"
                }
              />
              <InfoRow caption="Сумма заказа без скидки" value={sum + " тг"} />
              <InfoRow caption="Скидка" value={discount} />
              <InfoRow caption="Кассир" value={data.cashier} />
              <InfoRow
                caption="Комментарий"
                value={data.comment === "" ? " - " : data.comment}
              />
              <InfoRow
                caption="Заказ из Магазина Kaspi.kz"
                value={isKaspi ? data.kaspiinfo.order_code : "Нет"}
              />
              <InfoRow caption="История заказа" value={historyList} />
              <div className={cl.OrderButtons}>
                {OrderButtons.map((item) => {
                  return item.show ? (
                    <div className={cl.OrderButtonsRow} key={item.id}>
                      {item.buttons.map((item2, index) => {
                        return (
                          <button
                            disabled={item2.disabled}
                            onClick={item2.onClick}
                            className={
                              cl.OrderButtonsButton +
                              " " +
                              (item2.fill === "fill"
                                ? cl.OrderButtonsButtonFill
                                : cl.OrderButtonsButtonOutline) +
                              " " +
                              (index + 1 === item.length
                                ? cl.OrderButtonsLastButton
                                : "")
                            }
                            key={item2.name}
                          >
                            {item2.text}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    ""
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal
        noEscape={processLoading}
        modalVisible={pickDeliverModal}
        setModalVisible={setPickDeliverModal}
      >
        <p>Выберите курьера</p>
        <Select
          value={deliver}
          options={delivers}
          loading={deliversLoading || processLoading}
          setValue={setDeliver}
          type={"managers"}
          style={{ margin: "10px 0" }}
        />
        <div className={cl.Center}>
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
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={confirmModal}
        setModalVisible={setConfirmModal}
      >
        <p>Подтвердите действие:</p>
        <p>Вы действительно хотите завершить этот заказ?</p>
        <div
          className={cl.Center}
          style={{ justifyContent: "space-around", marginTop: 20 }}
        >
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
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={cancelModal}
        setModalVisible={setCancelModal}
      >
        <p>Подтвердите действие:</p>
        <p>Вы действительно хотите отменить этот заказ?</p>
        <p>Пожалуйста, введите причину ниже.</p>
        <SearchInput
          value={cause}
          setValue={setCause}
          placeholder="Причина отмены"
          type="text"
        />
        <div
          className={cl.Center}
          style={{ justifyContent: "space-around", marginTop: 20 }}
        >
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
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={recreateModal}
        setModalVisible={setRecreateModal}
      >
        <p>Подтвердите действие:</p>
        <p>Вы действительно хотите отказаться от этого заказа?</p>
        <p>Пожалуйста, введите причину ниже.</p>
        <SearchInput
          value={cause}
          setValue={setCause}
          placeholder="Причина отмены"
          type="text"
        />
        <div
          className={cl.Center}
          style={{ justifyContent: "space-around", marginTop: 20 }}
        >
          {buttons7.map((button) => {
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
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={returnModal}
        setModalVisible={setReturnModal}
      >
        <p>Подтвердите действие:</p>
        <p>Вы действительно хотите оформить возврат этого заказа?</p>
        <p>Пожалуйста, введите причину ниже.</p>
        <SearchInput
          value={cause}
          setValue={setCause}
          placeholder="Причина отмены"
          type="text"
        />
        <div
          className={cl.Center}
          style={{ justifyContent: "space-around", marginTop: 20 }}
        >
          {buttons8.map((button) => {
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
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={addPaymentModal}
        setModalVisible={setAddPaymentModal}
      >
        <p>Добавьте оплату</p>
        <p>Общая сумма: {sumWithDiscount}тг</p>
        <p>Уже оплачено: {paymentSum}тг</p>
        <p>Осталось к оплате: {-difference}тг</p>
        <div
          className={cl.tableWrapper}
          style={{
            height: "inherit",
            margin: "20px 0",
            minWidth: 320,
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
                      paymentMethods={fetchedPaymentMethods}
                      key={item.id}
                      setPayment={setPayment}
                      payment={payment}
                      editable={!processLoading || item.editable}
                      index={index + 1}
                      paymentItem={item}
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
          {buttons4.map((button) => {
            return (
              <button
                disabled={button.disabled}
                key={button.text}
                onClick={button.onClick}
                className={cl.OptionsButton}
                style={{ marginBottom: 5 }}
              >
                {button.icon}
                {button.text}
              </button>
            );
          })}
        </div>
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={confirmPickupModal}
        setModalVisible={setConfirmPickupModal}
      >
        <p>Добавьте оплату</p>
        <p>Общая сумма: {sumWithDiscount}тг</p>
        <p>Уже оплачено: {paymentSum}тг</p>
        <p>Осталось к оплате: {-difference}тг</p>
        <div
          className={cl.tableWrapper}
          style={{
            height: "inherit",
            margin: "20px 0",
            minWidth: 320,
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
                      paymentMethods={fetchedPaymentMethods}
                      key={item.id}
                      setPayment={setPayment}
                      payment={payment}
                      editable={!processLoading || item.editable}
                      index={index + 1}
                      paymentItem={item}
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
          {buttons9.map((button) => {
            return (
              <button
                disabled={button.disabled}
                key={button.text}
                onClick={button.onClick}
                className={cl.OptionsButton}
                style={{ marginBottom: 5 }}
              >
                {button.icon}
                {button.text}
              </button>
            );
          })}
        </div>
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={codeModal}
        setModalVisible={setCodeModal}
      >
        <p>Подтверждение кода:</p>
        <LegendInput
          value={code}
          setValue={setCode}
          legend="Код"
          disabled={processLoading}
          inputMode="numeric"
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            marginTop: 10,
          }}
        >
          <Button
            disabled={processLoading}
            text="Подтвердить"
            icon={<BiCheckCircle />}
            onClick={() => {}}
          />
        </div>
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={editManagerModal}
        setModalVisible={setEditManagerModal}
      >
        <p>Выберите курьера</p>
        <Select
          value={newManager}
          options={managersWithStore}
          loading={managersLoading || processLoading}
          setValue={setNewManager}
          type={"managerswithstore"}
          style={{ margin: "10px 0" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            marginTop: 10,
          }}
        >
          <Button
            disabled={processLoading}
            text="Подтвердить"
            icon={<BiCheckCircle />}
            onClick={() => {
              if (
                window.confirm(
                  "Вы уверены что хотите поменять продавца этой продажи?"
                )
              ) {
                editOrderManager({
                  newManager,
                  setProcessLoading,
                  orderId: id,
                  next: () => navigate(0),
                });
              }
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

export default OrderDetails;
