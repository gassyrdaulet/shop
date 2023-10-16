import { useState, useEffect, useMemo, useCallback } from "react";
import moment from "moment";
import cl from "../styles/Goods.module.css";
import SearchInput from "../components/SearchInput";
import Select from "../components/Select";
import Button from "../components/Button";
import { getFinishedOrdersForSummary as getFinishedOrders } from "../api/OrderService";
import Loading from "../components/Loading";

function ABC() {
  const [fecthLoading, setFetchLoading] = useState(false);
  const [firstDate, setFirstDate] = useState(
    moment().startOf("day").subtract(14, "days").format("yyyy-MM-DD")
  );
  const [secondDate, setSecondDate] = useState(
    moment().startOf("day").add(1, "days").format("yyyy-MM-DD")
  );
  const [searchInput, setSearchInput] = useState("");
  const [sortType, setSortType] = useState(1);
  const [countable, setCountable] = useState(1);
  const [orders, setOrders] = useState([]);
  const [dateType, setDateType] = useState(1);
  const buttons = [];
  const buttons2 = [];

  useEffect(() => {
    const fdate = moment()
      .startOf("day")
      .subtract(14, "days")
      .format("yyyy-MM-DD");
    const sdate = moment().startOf("day").add(1, "days").format("yyyy-MM-DD");
    setFirstDate(fdate);
    setSecondDate(sdate);
    getFinishedOrders({
      setFinishedOrdersLoading: setFetchLoading,
      setFinishedOrders: setOrders,
      firstDate: moment()
        .startOf("day")
        .subtract(14, "days")
        .format("yyyy-MM-DD"),
      secondDate: moment().startOf("day").add(1, "days").format("yyyy-MM-DD"),
      dateType: "finishedDate",
      delivery: null,
    });
  }, []);

  const countableOptions = useMemo(() => {
    return [
      { id: 3, name: "Все" },
      { id: 1, name: "Только те что входят в отчет" },
      { id: 2, name: "Только те что не входят в отчет" },
    ];
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

  const dateTypes = useMemo(() => {
    return {
      1: "finisheddate",
      2: "delivereddate",
      3: "wentdate",
      4: "creationdate",
    };
  }, []);

  const filteredOrders = useMemo(() => {
    try {
      const temp = orders.filter((order) => {
        return order.status === "finished" || order.status === "returned";
      });
      return temp;
    } catch (e) {
      console.log("Filter by Countable Error: ", e);
      return [];
    }
  }, [orders]);

  const filteredOrdersByCountable = useMemo(() => {
    try {
      const temp = filteredOrders.filter((order) => {
        const kaspiInfo = order?.kaspiinfo;
        const kaspiInfoObject = kaspiInfo ? Object.keys(kaspiInfo) : [];
        const isKaspi = kaspiInfoObject ? kaspiInfoObject.length > 0 : false;
        if (countable === 3) {
          return true;
        }
        if (countable === 2) {
          return !(
            (order.status === "finished" || order.status === "returned") &&
            order.countable === 1 &&
            !isKaspi
          );
        }
        if (countable === 1) {
          return (
            (order.status === "finished" || order.status === "returned") &&
            order.countable === 1 &&
            !isKaspi
          );
        }
        return true;
      });
      return temp;
    } catch (e) {
      console.log("Filter by Countable Error: ", e);
      return [];
    }
  }, [filteredOrders, countable]);

  const goodsTotal = useMemo(() => {
    const goods = [];
    filteredOrdersByCountable.forEach((order) => {
      order.goods.forEach((good) => {
        if (!goods[good.id]) {
          goods[good.id] = {
            id: good.id,
            goodName: good.name,
            sales: good.quantity,
            sum: good.price * good.quantity,
            profit: good.quantity * (good.price - good.purchase),
          };
          return;
        }
        goods[good.id].sales += good.quantity;
        goods[good.id].sum += good.price * good.quantity;
        goods[good.id].profit += good.quantity * (good.price - good.purchase);
      });
    });
    const filteredFromEmpty = goods.filter((good) => {
      if (!good) {
        return false;
      }
      return true;
    });
    return filteredFromEmpty;
  }, [filteredOrdersByCountable]);

  const sortedGoods = useMemo(() => {
    const sortedArray = [...goodsTotal].sort((a, b) => {
      return b.profit - a.profit;
    });
    const biggestProfit = sortedArray[0]?.profit ? sortedArray[0]?.profit : 0;
    let totalProfit = 0;
    const arrayWithRating = sortedArray.map((item) => {
      totalProfit += item.profit;
      return { ...item, rating: (item.profit * 100) / biggestProfit };
    });
    let controlProfit = 0;
    const arrayWithABC = arrayWithRating.map((item) => {
      controlProfit += item.profit;
      const percent = (controlProfit * 100) / totalProfit;
      return { ...item, ABC: percent < 80 ? "A" : percent < 95 ? "B" : "C" };
    });
    return arrayWithABC;
  }, [goodsTotal]);

  const sortBySales = useMemo(() => {
    if (sortType === 1) {
      return sortedGoods;
    }
    const sortedArray = [...sortedGoods].sort((a, b) => {
      return b.sales - a.sales;
    });
    return sortedArray;
  }, [sortedGoods, sortType]);

  const handleUpdate = useCallback(() => {
    getFinishedOrders({
      setFinishedOrdersLoading: setFetchLoading,
      setFinishedOrders: setOrders,
      firstDate,
      secondDate,
      dateType: dateTypes[dateType],
      delivery: null,
      next: () => {},
    });
  }, [firstDate, secondDate, dateTypes, dateType]);

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
          <p>С:</p>
          <SearchInput
            placeholder="с"
            value={firstDate}
            isDate={true}
            setValue={setFirstDate}
            className={cl.SearchInput}
            type="date"
          />
          <p>До:</p>
          <SearchInput
            placeholder="до"
            isDate={true}
            value={secondDate}
            setValue={setSecondDate}
            className={cl.SearchInput}
            type="date"
          />
          <p>По дате:</p>
          <Select
            type="dateType"
            options={dateTypesOptions}
            setValue={setDateType}
            value={dateType}
            loading={fecthLoading}
            style={{ margin: "10px 0" }}
          />
          <p>Отчет:</p>
          <Select
            value={countable}
            options={countableOptions}
            setValue={setCountable}
            type={"pickup"}
            style={{ margin: "10px 0" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div></div>
            <Button
              disabled={fecthLoading}
              onClick={handleUpdate}
              text="Применить"
            />
          </div>
        </div>
        <div className={cl.secondHalf}>
          <div className={cl.inputsMobile}>
            <p>С:</p>
            <SearchInput
              placeholder="с"
              value={firstDate}
              isDate={true}
              setValue={setFirstDate}
              className={cl.SearchInput}
              type="date"
            />
            <p>До:</p>
            <SearchInput
              placeholder="до"
              isDate={true}
              value={secondDate}
              setValue={setSecondDate}
              className={cl.SearchInput}
              type="date"
            />
            <p>По дате:</p>
            <Select
              type="dateType"
              options={dateTypesOptions}
              setValue={setDateType}
              value={dateType}
              loading={fecthLoading}
              style={{ margin: "10px 0" }}
            />
            <p>Отчет:</p>
            <Select
              value={countable}
              options={countableOptions}
              setValue={setCountable}
              type={"pickup"}
              style={{ margin: "10px 0" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div></div>
              <Button onClick={handleUpdate} text="Применить" />
            </div>
          </div>
          <SearchInput
            placeholder="Поиск товара"
            value={searchInput}
            setValue={setSearchInput}
            className={cl.SearchInput}
          />
          <div
            className={cl.tableWrapper}
            style={{ height: "inherit", margin: "15px 0", maxHeight: 1000 }}
          >
            {fecthLoading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Loading />
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Товар</th>
                    <th
                      onClick={() => setSortType(2)}
                      style={{
                        backgroundColor: sortType === 2 ? "#eeee33" : "initial",
                      }}
                    >
                      Количество продаж
                    </th>
                    <th>Выручка</th>
                    <th
                      onClick={() => setSortType(1)}
                      style={{
                        backgroundColor: sortType === 1 ? "#eeee33" : "initial",
                      }}
                    >
                      Прибыль
                    </th>
                    <th>Рейтинг</th>
                    <th>ABC</th>
                  </tr>
                </thead>
                {sortBySales.length === 0 ? (
                  <tbody style={{ width: "100%", textAlign: "center" }}>
                    <tr>
                      <td colSpan={10}>Ничего не найдено</td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {sortBySales.map((total, index) => {
                      return (
                        <tr
                          key={total.id}
                          style={{
                            backgroundColor:
                              total.ABC === "A"
                                ? "#ccffcc"
                                : total.ABC === "B"
                                ? "#ffffcc"
                                : "#ffe9e9",
                          }}
                        >
                          <td
                            style={{
                              minWidth: "inherit",
                              width: 40,
                              maxWidth: 40,
                              textAlign: "center",
                            }}
                          >
                            {index + 1}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                            }}
                          >
                            {total.goodName}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                            }}
                          >
                            {total.sales} шт.
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                            }}
                          >
                            {total.sum.toFixed(2)} ₸
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                            }}
                          >
                            {total.profit.toFixed(2)} ₸
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                            }}
                          >
                            {total.rating.toFixed(1)} %
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                            }}
                          >
                            {total.ABC}
                          </td>
                        </tr>
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

export default ABC;
