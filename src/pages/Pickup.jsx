import cl from "../styles/Goods.module.css";
import {
  BsPlusCircle,
  BsFillCarFrontFill,
  BsStarFill,
  BsServer,
  BsQuestionCircleFill,
  BsHourglassSplit,
} from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { useMemo, useEffect, useState, useCallback } from "react";
import StatusRow from "../components/StatusRow";
import { getFinishedOrders, getOrders } from "../api/OrderService";
import OrderPickup from "../components/OrderPickup";
import OrderHeadersPickup from "../components/OrderHeadersPickup";
import Loading from "../components/Loading";
import SearchInput from "../components/SearchInput";
import LegendInput from "../components/LegendInput";
import Select from "../components/Select";
import moment from "moment";
import { BiSync } from "react-icons/bi";
import { getManagers } from "../api/OrganizationService";

function Pickup() {
  const navigate = useNavigate();
  const { orderStatus } = useParams();
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [managersLoading, setManagersLoading] = useState(false);
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
    const types = ["new", "archive"];
    for (let type of types) {
      if (orderStatus === type) {
        return;
      }
    }
    navigate("/error");
  }, [orderStatus, navigate]);

  const handleMark = (id) => {
    if (orderStatus !== "new") {
      return;
    }
    const temp = { ...markedIds };
    if (temp[id]) {
      delete temp[id];
    } else {
      temp[id] = true;
    }
    setMarkedIds(temp);
  };

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
        delivery: false,
      });
    },
    []
  );

  useEffect(() => {
    setFirstDate(moment().startOf("day").format("yyyy-MM-DD"));
    setSecondDate(moment().startOf("day").add(1, "days").format("yyyy-MM-DD"));
    getManagers({ setManagers, setManagersLoading });
    getFinishedOrdersCallback();
    getOrders({ setOrdersLoading, setOrders, status: "pickup" });
  }, [getFinishedOrdersCallback]);

  const buttons = [
    {
      show: true,
      icon: <BsPlusCircle />,
      text: "Новый заказ",
      onClick: () => navigate("/orders/new"),
    },
  ];

  const orderStatuses = useMemo(() => {
    return [
      {
        text: "Ожидает выдачи",
        onClick: () => {
          navigate("/pickup/new");
        },
        name: "new",
      },
      {
        text: "Архив",
        onClick: () => {
          navigate("/pickup/archive");
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
      new: "awaiting",
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
    if (orderStatus === "archive") {
      const temp = [...finishedOrders];
      return temp;
    }
    const temp = orders.filter((order) => {
      return order.status === statuses[orderStatus];
    });
    return temp;
  }, [orders, orderStatus, statuses, finishedOrders]);

  const sortedOrders = useMemo(() => {
    try {
      if (sort === 1 || sort === 2) {
        const temp = [...filteredOrders].sort((a, b) => {
          let result = 0;
          if (moment(a.creationdate) < moment(b.creationdate)) {
            result = sort === 1 ? 1 : -1;
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

  const filteredOrdersBySearch = useMemo(() => {
    try {
      const temp = filteredOrdersByManager.filter((order) => {
        return (
          (order.id + "").toLowerCase().includes(searchInput.toLowerCase()) ||
          order.comment.toLowerCase().includes(searchInput.toLowerCase())
        );
      });
      return temp;
    } catch (e) {
      return [];
    }
  }, [filteredOrdersByManager, searchInput]);

  const markAll = () => {
    if (orderStatus !== "waiting") {
      return;
    }
    const temp = { ...markedIds };
    filteredOrdersBySearch.forEach((order) => {
      temp[order.id] = true;
    });
    setMarkedIds(temp);
  };

  const unmarkAll = useCallback(() => {
    setMarkedIds({});
  }, []);

  useEffect(() => {
    setMarkedIds({});
  }, [orderStatus, manager, searchInput, filteredOrdersBySearch]);

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
          {orderStatuses.map((item, index) => {
            return (
              <StatusRow
                item={item}
                index={index}
                totalLength={orderStatuses.length}
                deliveryStatus={orderStatus}
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
              {orderStatuses.map((item, index) => {
                return (
                  <StatusRow
                    mobile={true}
                    item={item}
                    index={index}
                    totalLength={1000 - 7}
                    deliveryStatus={orderStatus}
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
            {orderStatus === "archive" ? (
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
                  <OrderHeadersPickup
                    markAll={markAll}
                    allMarked={allMarked}
                    unmarkAll={unmarkAll}
                    status={orderStatus}
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
                        <OrderPickup
                          handleMark={handleMark}
                          checked={markedIds[order.id]}
                          index={index}
                          key={order.id}
                          order={order}
                          status={orderStatus}
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
    </div>
  );
}

export default Pickup;
