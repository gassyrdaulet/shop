import { useState, useEffect, useMemo, useCallback } from "react";
import moment from "moment";
import cl from "../styles/Goods.module.css";
import SearchInput from "../components/SearchInput";
import Select from "../components/Select";
import Button from "../components/Button";
import { getManagers } from "../api/OrganizationService";
import { getFinishedOrders } from "../api/OrderService";
import Loading from "../components/Loading";

function UserSummary() {
  const [fecthLoading, setFetchLoading] = useState(false);
  const [firstDate, setFirstDate] = useState(
    moment().startOf("day").format("yyyy-MM-DD")
  );
  const [secondDate, setSecondDate] = useState(
    moment().startOf("day").add(1, "days").format("yyyy-MM-DD")
  );
  const [selectedDates, setSelectedDates] = useState({
    firstDate,
    secondDate,
  });
  const [managers, setManagers] = useState([]);
  const [manager, setManager] = useState(localStorage.getItem("id"));
  const [managersLoading, setManagersLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const buttons = [];
  const buttons2 = [];

  useEffect(() => {
    getFinishedOrders({
      setFinishedOrdersLoading: setFetchLoading,
      setFinishedOrders: setOrders,
      firstDate: moment().startOf("day").format("yyyy-MM-DD"),
      secondDate: moment().startOf("day").add(1, "days").format("yyyy-MM-DD"),
      dateType: "finishedDate",
      delivery: null,
    });
    getManagers({ setManagers, setManagersLoading });
  }, []);

  const filteredOrdersByManager = useMemo(() => {
    try {
      const temp = orders.filter((order) => {
        return order.authorId === manager;
      });
      return temp;
    } catch (e) {
      console.log("Filter by Managers Error: ", e);
      return [];
    }
  }, [orders, manager]);

  const totals = useMemo(() => {
    const orders = filteredOrdersByManager;
    let totalSum = 0;
    let totalPurchaseSum = 0;
    orders.forEach((order) => {
      let orderSum = 0;
      let purchaseSum = 0;
      let discountSum = 0;
      let orderDiscountSum = 0;
      let sum = 0;
      order.goods.forEach((good) => {
        discountSum +=
          good.discount.type === "KZT"
            ? parseInt(good.discount.amount) * parseInt(good.quantity)
            : ((good.price * parseInt(good.discount.amount)) / 100) *
              parseInt(good.quantity);
        orderSum += parseInt(good.price) * parseInt(good.quantity);
        purchaseSum += parseInt(good.purchase) * parseInt(good.quantity);
      });
      sum = orderSum - discountSum;
      orderDiscountSum =
        order.discount.type === "KZT"
          ? parseInt(order.discount.amount)
          : (sum * order.discount.amount) / 100;
      totalSum += sum - orderDiscountSum;
      totalPurchaseSum += purchaseSum;
    });
    return [
      { text: "Реализовано:", sum: totalSum + "  ₸" },
      { text: "Прибыль:", sum: totalSum - totalPurchaseSum + "  ₸" },
      { text: "Всего продаж:", sum: orders.length + " шт." },
    ];
  }, [filteredOrdersByManager]);

  const totalsByDays = useMemo(() => {
    const dateDifference = moment(selectedDates.secondDate).diff(
      moment(selectedDates.firstDate),
      "days"
    );
    const temp = [];
    for (let i = 0; i < dateDifference; i++) {
      temp.push({
        sum: 0,
        orders: [],
        profit: 0,
        date: moment(selectedDates.secondDate).subtract(i + 1, "day"),
      });
    }
    filteredOrdersByManager.forEach((order) => {
      for (let item of temp) {
        if (moment(order.finisheddate).isSame(moment(item.date), "day")) {
          item.orders.push(order);
          break;
        }
      }
    });
    temp.forEach((day) => {
      let totalSum = 0;
      let totalPurchaseSum = 0;
      day.orders.forEach((order) => {
        let orderSum = 0;
        let purchaseSum = 0;
        let discountSum = 0;
        let orderDiscountSum = 0;
        let sum = 0;
        order.goods.forEach((good) => {
          discountSum +=
            good.discount.type === "KZT"
              ? parseInt(good.discount.amount) * parseInt(good.quantity)
              : ((good.price * parseInt(good.discount.amount)) / 100) *
                parseInt(good.quantity);
          orderSum += parseInt(good.price) * parseInt(good.quantity);
          purchaseSum += parseInt(good.purchase) * parseInt(good.quantity);
        });
        sum = orderSum - discountSum;
        orderDiscountSum =
          order.discount.type === "KZT"
            ? parseInt(order.discount.amount)
            : (sum * order.discount.amount) / 100;
        totalSum += sum - orderDiscountSum;
        totalPurchaseSum += purchaseSum;
      });
      day.sum = totalSum;
      day.profit = totalSum - totalPurchaseSum;
    });
    return temp;
  }, [selectedDates, filteredOrdersByManager]);

  const handleUpdate = useCallback(() => {
    setSelectedDates({ firstDate, secondDate });
    getFinishedOrders({
      setFinishedOrdersLoading: setFetchLoading,
      setFinishedOrders: setOrders,
      firstDate,
      secondDate,
      dateType: "finisheddate",
      delivery: null,
    });
  }, [firstDate, secondDate]);

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
            setValue={setFirstDate}
            className={cl.SearchInput}
            type="date"
          />
          <p>До:</p>
          <SearchInput
            placeholder="до"
            value={secondDate}
            setValue={setSecondDate}
            className={cl.SearchInput}
            type="date"
          />
          <p>Продавец:</p>
          <Select
            value={manager}
            options={managers}
            loading={managersLoading}
            setValue={setManager}
            type={"managers"}
            style={{ margin: "10px 0" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div></div>
            <Button onClick={handleUpdate} text="Применить" />
          </div>
        </div>
        <div className={cl.secondHalf}>
          <div className={cl.inputsMobile}>
            <p>С:</p>
            <SearchInput
              placeholder="с"
              value={firstDate}
              setValue={setFirstDate}
              className={cl.SearchInput}
              type="date"
            />
            <p>До:</p>
            <SearchInput
              placeholder="до"
              value={secondDate}
              setValue={setSecondDate}
              className={cl.SearchInput}
              type="date"
            />
            <p>Продавец:</p>
            <Select
              value={manager}
              options={managers}
              loading={managersLoading}
              setValue={setManager}
              type={"managers"}
              style={{ margin: "10px 0" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div></div>
              <Button onClick={handleUpdate} text="Применить" />
            </div>
          </div>
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
            <div
              className={cl.totals}
              style={{
                marginTop: 15,
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              {totals.map((total) => {
                return (
                  <div
                    key={total.text}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: "bold",
                        textTransform: "uppercase",
                      }}
                    >
                      {total.text}
                    </p>
                    <p style={{ fontSize: 20 }}>{total.sum}</p>
                  </div>
                );
              })}
            </div>
          )}

          <div
            className={cl.tableWrapper}
            style={{ height: "inherit", marginTop: 30, marginBottom: 30 }}
          >
            <table>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Количество продаж</th>
                  <th>На сумму</th>
                  <th>Прибыль</th>
                </tr>
              </thead>
              <tbody>
                {totalsByDays.map((total) => {
                  return (
                    <tr key={total.date}>
                      <td
                        style={{
                          minWidth: "inherit",
                          width: 60,
                          maxWidth: 60,
                          textAlign: "center",
                        }}
                      >
                        {moment(total.date).format("DD.MM.yyyy")}
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        {total.orders.length} шт.
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        {total.sum} ₸
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        {total.profit} ₸
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserSummary;
