import cl from "../styles/Goods.module.css";
import {
  BsPlusCircle,
  BsFillCarFrontFill,
  BsStarFill,
  BsServer,
  BsQuestionCircleFill,
  BsHourglassSplit,
  BsSend,
} from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { useMemo, useEffect, useState, useCallback } from "react";
import StatusRow from "../components/StatusRow";
import { getFinishedOrders, getOrders } from "../api/OrderService";
import Order from "../components/Order";
import OrderHeaders from "../components/OrderHeaders";
import Loading from "../components/Loading";
import SearchInput from "../components/SearchInput";
import LegendInput from "../components/LegendInput";
import Select from "../components/Select";
import moment from "moment";
import { BiSync, BiCheck, BiChevronLeftCircle } from "react-icons/bi";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { getDelivers, getManagers } from "../api/OrganizationService";
import { sendDeliver, finishOrder } from "../api/OrderService";
import Modal from "../components/Modal";

function Delivery() {
  const navigate = useNavigate();
  const [pickDeliverModal, setPickDeliverModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);
  const { deliveryStatus } = useParams();
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [deliversLoading, setDeliversLoading] = useState(false);
  const [managersLoading, setManagersLoading] = useState(false);
  const [delivers, setDelivers] = useState([]);
  const [deliver, setDeliver] = useState(-1);
  const [deliverForSend, setDeliverForSend] = useState(-1);
  const [managers, setManagers] = useState([]);
  const [manager, setManager] = useState(-1);
  const [sort, setSort] = useState(1);
  const [finishedOrdersLoading, setFinishedOrdersLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [finishedOrders, setFinishedOrders] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [firstDate, setFirstDate] = useState(
    moment().startOf("day").format("yyyy-MM-DD")
  );
  const [secondDate, setSecondDate] = useState(
    moment().startOf("day").add(1, "days").format("yyyy-MM-DD")
  );
  const [dateType, setDateType] = useState(1);
  const [markedIds, setMarkedIds] = useState({});

  useEffect(() => {
    const types = ["new", "processing", "delivering", "archive"];
    for (let type of types) {
      if (deliveryStatus === type) {
        return;
      }
    }
    navigate("/error");
  }, [deliveryStatus, navigate]);

  const handleMark = (id) => {
    if (deliveryStatus !== "new") {
      if (deliveryStatus !== "processing") {
        return;
      }
    }
    // if (deliveryStatus === "processing") {
    //   if (deliver === -1) {
    //     return;
    //   }
    // }
    const temp = { ...markedIds };
    if (temp[id]) {
      delete temp[id];
    } else {
      temp[id] = true;
    }
    setMarkedIds(temp);
  };

  const buttons3 = [
    {
      disabled: processLoading || deliversLoading,
      icon: <AiOutlineCheckCircle />,
      text: "Отправить",
      onClick: () => {
        sendDeliver({
          deliver: deliverForSend,
          setProcessLoading,
          next: () => {
            setPickDeliverModal(false);
            navigate(0);
          },
          orderIds: Object.keys(markedIds),
        });
      },
    },
  ];

  const buttons5 = [
    {
      disabled: processLoading,
      icon: <BiChevronLeftCircle />,
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
          ids: Object.keys(markedIds),
          setProcessLoading,
          deliver,
          next: () => {
            navigate(0);
          },
          deliveryList: payoffDeliveriesList,
        });
      },
    },
  ];

  const getFinishedOrdersCallback = useCallback(
    (firstDate, secondDate, dateType = "finisheddate") => {
      getFinishedOrders({
        setFinishedOrders,
        setFinishedOrdersLoading,
        firstDate: firstDate
          ? firstDate
          : moment().startOf("day").format("yyyy-MM-DD"),
        secondDate: secondDate
          ? secondDate
          : moment().startOf("day").add(1, "days").format("yyyy-MM-DD"),
        dateType,
      });
    },
    []
  );

  useEffect(() => {
    getDelivers({ setDelivers, setDeliversLoading });
    getManagers({ setManagers, setManagersLoading });
    getFinishedOrdersCallback();
    getOrders({ setOrdersLoading, setOrders });
  }, [getFinishedOrdersCallback]);

  const someoneIsMarked = useMemo(() => {
    try {
      return Object.keys(markedIds).length > 0;
    } catch {
      return true;
    }
  }, [markedIds]);

  const buttons = [
    {
      show: someoneIsMarked && deliveryStatus === "new",
      icon: <BsSend />,
      text: "Отправить",
      onClick: () => setPickDeliverModal(true),
    },
    {
      show: someoneIsMarked && deliveryStatus === "processing",
      icon: <BiCheck />,
      text: "Подтвердить",
      onClick: () => setConfirmModal(true),
    },
    {
      show: true,
      icon: <BsPlusCircle />,
      text: "Новый заказ",
      onClick: () => navigate("/orders/new"),
    },
  ];

  const deliveryStatuses = useMemo(() => {
    return [
      {
        text: "Новые",
        onClick: () => {
          navigate("/delivery/new");
        },
        name: "new",
      },
      {
        text: "На доставке",
        onClick: () => {
          navigate("/delivery/delivering");
        },
        name: "delivering",
      },
      {
        text: "Обработка",
        onClick: () => {
          navigate("/delivery/processing");
        },
        name: "processing",
      },
      {
        text: "Архив",
        onClick: () => {
          navigate("/delivery/archive");
        },
        name: "archive",
      },
    ];
  }, [navigate]);

  const statusesRussian = useMemo(() => {
    return {
      processing: "На обработке",
      awaiting: "Ожидает выдачи",
      returned: "Возвращен",
      cancelled: "Отменен",
      finished: "Завершен",
    };
  }, []);

  const icons = useMemo(() => {
    return {
      new: <BsStarFill />,
      awaits: <BsQuestionCircleFill />,
      processing: <BsHourglassSplit />,
      delivering: <BsFillCarFrontFill />,
      archive: <BsServer />,
    };
  }, []);

  const statuses = useMemo(() => {
    return {
      new: "new",
      awaits: "waiting",
      processing: "processing",
      delivering: "delivering",
      archive: "archive",
    };
  }, []);

  const dateTypesOptions = useMemo(() => {
    return [
      {
        name: "По завершенной дате",
        id: 1,
      },
      {
        name: "По дате выдачи",
        id: 2,
      },
      {
        name: "По дате отправления",
        id: 3,
      },
      {
        name: "По дате создания",
        id: 4,
      },
    ];
  }, []);

  const sortOptions = useMemo(() => {
    return [
      {
        name: "Сперва новые",
        id: 1,
      },
      {
        name: "Сперва старые",
        id: 2,
      },
      {
        name: "По статусам",
        id: 3,
      },
    ];
  }, []);

  const dateTypes = useMemo(() => {
    return {
      1: "finisheddate",
      2: "delivereddate",
      3: "wentdate",
      4: "creationdate",
    };
  }, []);

  const dateTypesRussian = useMemo(() => {
    return {
      1: "Дата завершения",
      2: "Дата выдачи",
      3: "Дата отправки",
      4: "Дата создания",
    };
  }, []);

  const ordersTotals = useMemo(() => {
    try {
      const result = {};
      orders.forEach((order) => {
        const prev = result[order.deliverystatus]
          ? result[order.deliverystatus]
          : 0;
        result[order.deliverystatus] = prev + 1;
      });
      return result;
    } catch {
      return {};
    }
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (deliveryStatus === "archive") {
      const temp = [...finishedOrders];
      return temp;
    }
    const temp = orders.filter((order) => {
      return order.deliverystatus === statuses[deliveryStatus];
    });
    return temp;
  }, [orders, deliveryStatus, statuses, finishedOrders]);

  const sortedOrders = useMemo(() => {
    try {
      if (sort === 1 || sort === 2) {
        const temp = [...filteredOrders].sort((a, b) => {
          let result = 0;
          if (moment(a.creationdate) < moment(b.creationdate)) {
            result = sort === 2 ? -1 : 1;
          }
          if (moment(a.creationdate) > moment(b.creationdate)) {
            result = sort === 2 ? 1 : -1;
          }
          return result;
        });
        return temp;
      } else if (sort === 3) {
        const temp = [...filteredOrders].sort((a, b) => {
          return -a.status.localeCompare(b.status);
        });
        return temp;
      }
    } catch (e) {
      console.log("Sort Error:", e);
      return [];
    }
  }, [filteredOrders, sort]);

  const filteredOrdersByManager = useMemo(() => {
    try {
      if (manager === -1) {
        return sortedOrders;
      }
      const temp = sortedOrders.filter((order) => {
        return order.authorId === parseInt(manager);
      });
      return temp;
    } catch (e) {
      return [];
    }
  }, [sortedOrders, manager]);

  const filteredOrdersByDeliver = useMemo(() => {
    try {
      if (deliver === -1) {
        return filteredOrdersByManager;
      }
      const temp = filteredOrdersByManager.filter((order) => {
        return order.deliverId === parseInt(deliver);
      });
      return temp;
    } catch (e) {
      return [];
    }
  }, [filteredOrdersByManager, deliver]);

  const filteredOrdersBySearch = useMemo(() => {
    try {
      const temp = filteredOrdersByDeliver.filter((order) => {
        return (
          order.deliveryinfo.address
            .toLowerCase()
            .includes(searchInput.toLowerCase()) ||
          (order.id + "").toLowerCase().includes(searchInput.toLowerCase()) ||
          order.comment.toLowerCase().includes(searchInput.toLowerCase())
        );
      });
      return temp;
    } catch (e) {
      return [];
    }
  }, [filteredOrdersByDeliver, searchInput]);

  const markAll = () => {
    if (deliveryStatus !== "new") {
      if (deliveryStatus !== "processing") {
        return;
      }
    }
    // if (deliveryStatus === "processing") {
    //   if (deliver === -1) {
    //     return;
    //   }
    // }
    const temp = { ...markedIds };
    filteredOrdersBySearch.forEach((order) => {
      temp[order.id] = true;
    });
    setMarkedIds(temp);
  };

  const unmarkAll = () => {
    setMarkedIds({});
  };

  useEffect(() => {
    setMarkedIds({});
  }, [deliveryStatus, deliver, manager, searchInput, filteredOrdersBySearch]);

  const allMarked = useMemo(() => {
    try {
      if (filteredOrdersBySearch.length === 0) {
        return false;
      }
      const temp = { ...markedIds };
      return Object.keys(temp).length === filteredOrdersBySearch.length;
    } catch (e) {
      console.log("AllMarked error:", e);
      return false;
    }
  }, [markedIds, filteredOrdersBySearch]);

  const payoffDeliveriesList = useMemo(() => {
    if (deliveryStatus !== "processing") {
      return [];
    }
    const result = [];
    Object.keys(markedIds).forEach((id) => {
      for (let order of orders) {
        if (order.id === parseInt(id)) {
          const { goods, deliveryinfo, discount } = order;
          let sum = 0;
          goods.forEach(
            (good) =>
              (sum +=
                good.quantity * good.price -
                (good.discount.type === "percent"
                  ? ((good.price * good.discount.amount) / 100) * good.quantity
                  : good.discount.amount * good.quantity))
          );
          const deliveryPrice = parseInt(
            deliveryinfo["deliveryPriceForCustomer"]
          );
          sum += isNaN(deliveryPrice) ? 0 : deliveryPrice;
          let sumWithDiscount =
            sum -
            (discount.type === "percent"
              ? (sum * discount.amount) / 100
              : discount.amount);
          result.push({
            id,
            address: order.deliveryinfo.address,
            deliveryPay: order.deliveryinfo.deliveryPriceForDeliver,
            sum: sumWithDiscount,
            status: order.status,
          });
        }
      }
    });
    return result;
  }, [markedIds, orders, deliveryStatus]);

  const payoffDeliveriesSum = useMemo(() => {
    if (payoffDeliveriesList.length === 0) {
      return undefined;
    }
    let orderSums = 0;
    let deliveryCosts = 0;
    payoffDeliveriesList.forEach((item) => {
      if (item.status === "cancelled") {
        return;
      }
      orderSums += item.sum;
      deliveryCosts += item.deliveryPay;
    });
    return { orderSums, deliveryCosts };
  }, [payoffDeliveriesList]);

  return (
    <div className="pageWrapper">
      <div className={cl.Options}>
        <div></div>
        <div className={cl.OptionsButtons}>
          {buttons.map((button) => {
            if (button.show) {
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
            }
            return "";
          })}
        </div>
      </div>
      <div className={cl.goodsWrapper}>
        <div className={cl.groupsWrapper}>
          {deliveryStatuses.map((item, index) => {
            return (
              <StatusRow
                item={item}
                index={index}
                totalLength={deliveryStatuses.length}
                deliveryStatus={deliveryStatus}
                key={item.name}
                icons={icons}
                total={ordersTotals[item.name]}
              />
            );
          })}
        </div>
        <div className={cl.TableMainWrapper}>
          <div className={cl.inputsMobile} style={{}}>
            <div className={cl.mobileStatusesWrapper}>
              {deliveryStatuses.map((item, index) => {
                return (
                  <StatusRow
                    mobile={true}
                    item={item}
                    index={index}
                    totalLength={1000 - 7}
                    deliveryStatus={deliveryStatus}
                    key={item.name}
                    icons={icons}
                    total={ordersTotals[item.name]}
                  />
                );
              })}
            </div>
          </div>
          <SearchInput
            placeholder="Поиск заказа"
            value={searchInput}
            setValue={setSearchInput}
            className={cl.SearchInput}
          />
          <div className={cl.filtersWrapper}>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div className={cl.mobileFilters}>
                <div className={cl.mobileFiltersItem}>
                  <p>Продавец</p>
                  <Select
                    value={manager}
                    setValue={setManager}
                    loading={managersLoading}
                    options={managers}
                    style={{ margin: 0 }}
                    type="managers2"
                  />
                </div>
                <div className={cl.mobileFiltersItem}>
                  <p>Курьер</p>
                  <Select
                    value={deliver}
                    setValue={setDeliver}
                    loading={deliversLoading}
                    options={delivers}
                    style={{ margin: 0 }}
                    type="managers2"
                  />
                </div>
                <div className={cl.mobileFiltersItem}>
                  <p>Сортировка</p>
                  <Select
                    options={sortOptions}
                    value={sort}
                    setValue={setSort}
                    style={{ margin: 0 }}
                    type="sort"
                  />
                </div>
              </div>
            </div>
            {deliveryStatus === "archive" ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <div style={{ marginRight: 5 }}>
                    <LegendInput
                      value={firstDate}
                      setValue={(v) => setFirstDate(v)}
                      type="date"
                      legend="Дата с:"
                      disabled={finishedOrdersLoading}
                    />
                  </div>
                  <div style={{ marginLeft: 5 }}>
                    <LegendInput
                      value={secondDate}
                      setValue={(v) => setSecondDate(v)}
                      type="date"
                      legend="Дата до:"
                      disabled={finishedOrdersLoading}
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Select
                    style={{ marginTop: 0 }}
                    type="dateType"
                    options={dateTypesOptions}
                    setValue={setDateType}
                    value={dateType}
                    loading={finishedOrdersLoading}
                  />
                  <div
                    onClick={() => {
                      getFinishedOrdersCallback(
                        moment(firstDate).format("yyyy-MM-DD"),
                        moment(secondDate).format("yyyy-MM-DD"),
                        dateTypes[dateType]
                      );
                    }}
                    style={{
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <BiSync size={30} />
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
          <div
            className={cl.tableWrapper}
            style={{ height: "inherit", marginBottom: 50, maxHeight: 600 }}
          >
            {ordersLoading || finishedOrdersLoading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "40vh",
                }}
              >
                <Loading which="gray" />
              </div>
            ) : (
              <table>
                <thead>
                  <OrderHeaders
                    markAll={markAll}
                    allMarked={allMarked}
                    unmarkAll={unmarkAll}
                    status={deliveryStatus}
                    dateType={dateTypesRussian[dateType]}
                  />
                </thead>
                {filteredOrdersBySearch.length === 0 ? (
                  <tbody style={{ width: "100%", textAlign: "center" }}>
                    <tr>
                      <td colSpan={1000 - 7}>
                        Не найдено заказов по данным критериам
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {filteredOrdersBySearch.map((order, index) => {
                      return (
                        <Order
                          handleMark={handleMark}
                          checked={markedIds[order.id]}
                          index={index}
                          key={order.id}
                          order={order}
                          status={deliveryStatus}
                          dateType={dateTypes[dateType]}
                          orderStatus={statusesRussian[order.status]}
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
        noEscape={processLoading}
        modalVisible={pickDeliverModal}
        setModalVisible={setPickDeliverModal}
      >
        <p>Выберите курьера</p>
        <Select
          value={deliverForSend}
          options={delivers}
          loading={deliversLoading || processLoading}
          setValue={setDeliverForSend}
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
        <p>Вы действительно хотите завершить эти заказы?</p>
        <div
          className={cl.tableWrapper}
          style={{ height: "inherit", maxHeight: "50vh" }}
        >
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Адрес</th>
                <th>Статус</th>
                <th>Стоимость доставки</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              {payoffDeliveriesList.length === 0 ? (
                <tr>
                  <td style={{ textAlign: "center" }} colSpan={1000 - 7}>
                    Нет Доставок
                  </td>
                </tr>
              ) : (
                payoffDeliveriesList.map((item, index) => {
                  return (
                    <tr
                      style={{
                        backgroundColor:
                          item.status === "cancelled" ? "#cd8faa" : "",
                      }}
                      key={item.id}
                    >
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td
                        style={{
                          width: "inherit",
                          maxWidth: "inherit",
                          minWidth: "100px",
                        }}
                      >
                        {item.address}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {statusesRussian[item.status]}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {item.deliveryPay} тг
                      </td>
                      <td style={{ textAlign: "center" }}>{item.sum} тг</td>
                    </tr>
                  );
                })
              )}
              <tr>
                <td colSpan={3}>
                  Всего:{" "}
                  {isNaN(
                    payoffDeliveriesSum?.orderSums -
                      payoffDeliveriesSum?.deliveryCosts
                  )
                    ? 0
                    : payoffDeliveriesSum?.orderSums -
                      payoffDeliveriesSum?.deliveryCosts}{" "}
                  тг
                </td>
                <td style={{ textAlign: "center" }}>
                  {payoffDeliveriesSum?.deliveryCosts
                    ? payoffDeliveriesSum.deliveryCosts
                    : 0}{" "}
                  тг
                </td>
                <td style={{ textAlign: "center" }}>
                  {payoffDeliveriesSum?.orderSums
                    ? payoffDeliveriesSum.orderSums
                    : 0}{" "}
                  тг
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
    </div>
  );
}

export default Delivery;
