import { useState, useEffect, useMemo, useCallback } from "react";
import moment from "moment";
import cl from "../styles/Goods.module.css";
import SearchInput from "../components/SearchInput";
import Select from "../components/Select";
import Button from "../components/Button";
import {
  getManagersForSummary as getManagers,
  getOrgInfo,
} from "../api/OrganizationService";
import { getFinishedOrders } from "../api/OrderService";
import Loading from "../components/Loading";

function UserSummary() {
  const [fecthLoading, setFetchLoading] = useState(false);
  const [fetchedPaymentMethods, setFetchedPaymentMethods] = useState([]);
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
  const [pickup, setPickup] = useState(3);
  const [manager, setManager] = useState(-2);
  const [managersLoading, setManagersLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [dateType, setDateType] = useState(1);
  const buttons = [];
  const buttons2 = [];

  useEffect(() => {
    getOrgInfo({
      setData: () => {},
      setFetchLoading: () => {},
      setValue: (key, v) => {
        if (key === "paymentMethods") {
          setFetchedPaymentMethods(v);
        }
      },
    });
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

  const pickupOptions = useMemo(() => {
    return [
      { id: 3, name: "Все" },
      { id: 1, name: "Доставка" },
      { id: 2, name: "Самовывоз" },
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

  const paymentMethods = useMemo(() => {
    const temp = {};
    for (let method of fetchedPaymentMethods) {
      temp[method.code] = parseFloat(method.value);
    }
    return temp;
  }, [fetchedPaymentMethods]);

  const paymentMethodNames = useMemo(() => {
    const temp = {};
    for (let method of fetchedPaymentMethods) {
      temp[method.code] = method.name;
    }
    return temp;
  }, [fetchedPaymentMethods]);

  const filteredOrdersByCountable = useMemo(() => {
    try {
      const temp = orders.filter((order) => {
        const wasReturned = order.wasReturned ? order.wasReturned : false;
        const kaspiInfo = order?.kaspiinfo;
        const kaspiInfoObject = kaspiInfo ? Object.keys(kaspiInfo) : [];
        const isKaspi = kaspiInfoObject ? kaspiInfoObject.length > 0 : false;
        return (
          order.status === "finished" &&
          order.countable === 1 &&
          !isKaspi &&
          !wasReturned
        );
      });
      return temp;
    } catch (e) {
      console.log("Filter by Countable Error: ", e);
      return [];
    }
  }, [orders]);

  const filteredOrdersByPickup = useMemo(() => {
    try {
      if (pickup === 3) {
        return filteredOrdersByCountable;
      }
      const temp = filteredOrdersByCountable.filter((order) => {
        if (pickup === 1) {
          return order.delivery !== 0;
        }
        if (pickup === 2) {
          return order.delivery !== 1;
        }
        return true;
      });
      return temp;
    } catch (e) {
      console.log("Filter by Countable Error: ", e);
      return [];
    }
  }, [filteredOrdersByCountable, pickup]);

  const filteredOrdersByManager = useMemo(() => {
    try {
      if (manager === -2) {
        return filteredOrdersByPickup;
      }
      const temp = filteredOrdersByPickup.filter((order) => {
        return order.authorId === manager;
      });
      return temp;
    } catch (e) {
      console.log("Filter by Managers Error: ", e);
      return [];
    }
  }, [filteredOrdersByPickup, manager]);

  const totals = useMemo(() => {
    const orders = filteredOrdersByManager;
    let totalSum = 0;
    let totalPurchaseSum = 0;
    let paymentComission = 0;
    orders.forEach((order) => {
      let orderSum = 0;
      let purchaseSum = 0;
      let discountSum = 0;
      let orderDiscountSum = 0;
      let sum = 0;
      let orderPaymentComission = 0;
      order.payment.forEach((payment) => {
        orderPaymentComission +=
          (payment.sum * paymentMethods[payment.method]) / 100;
      });
      order.goods.forEach((good) => {
        discountSum +=
          good.discount.type === "KZT"
            ? parseInt(good.discount.amount) * parseInt(good.quantity)
            : ((good.price * parseInt(good.discount.amount)) / 100) *
              parseInt(good.quantity);
        orderSum += parseInt(good.price) * parseInt(good.quantity);
        purchaseSum += parseInt(good.purchase) * parseInt(good.quantity);
      });
      paymentComission += orderPaymentComission;
      sum = orderSum - discountSum;
      orderDiscountSum =
        order.discount.type === "KZT"
          ? parseInt(order.discount.amount)
          : (sum * order.discount.amount) / 100;
      totalSum += sum - orderDiscountSum;
      totalPurchaseSum += purchaseSum;
    });
    return [
      { text: "Реализовано:", sum: totalSum.toFixed(2) + "  ₸" },
      {
        text: "Прибыль:",
        sum:
          (totalSum - totalPurchaseSum - paymentComission).toFixed(2) + "  ₸",
      },
      { text: "Всего продаж:", sum: orders.length + " шт." },
    ];
  }, [filteredOrdersByManager, paymentMethods]);

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
      let paymentComission = 0;
      day.orders.forEach((order) => {
        let orderSum = 0;
        let purchaseSum = 0;
        let discountSum = 0;
        let orderDiscountSum = 0;
        let sum = 0;
        let orderPaymentComission = 0;
        order.payment.forEach((payment) => {
          orderPaymentComission +=
            (payment.sum * paymentMethods[payment.method]) / 100;
        });
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
        paymentComission += orderPaymentComission;
      });
      day.sum = totalSum.toFixed(2);
      day.profit = (totalSum - totalPurchaseSum - paymentComission).toFixed(2);
    });
    return temp;
  }, [selectedDates, filteredOrdersByManager, paymentMethods]);

  const paymentTotals = useMemo(() => {
    try {
      const orders = filteredOrdersByManager;
      const temp = {};
      const final = [];
      orders.forEach((order) => {
        order.payment.forEach((payment) => {
          if (!temp[payment.method]) {
            temp[payment.method] = parseInt(payment.sum);
          } else {
            temp[payment.method] += parseInt(payment.sum);
          }
        });
      });
      Object.keys(temp).forEach((key, index) => {
        const sum = temp[key].toFixed(2);
        final.push({
          id: index,
          name: paymentMethodNames[key],
          sum,
          comission: ((sum * paymentMethods[key]) / 100).toFixed(2),
        });
      });
      return final;
    } catch (e) {
      console.log("Payment Totals Error:", e);
      return [];
    }
  }, [filteredOrdersByManager, paymentMethodNames, paymentMethods]);

  const handleUpdate = useCallback(() => {
    setSelectedDates({ firstDate, secondDate });
    getFinishedOrders({
      setFinishedOrdersLoading: setFetchLoading,
      setFinishedOrders: setOrders,
      firstDate,
      secondDate,
      dateType: dateTypes[dateType],
      delivery: null,
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
          <p>По дате:</p>
          <Select
            type="dateType"
            options={dateTypesOptions}
            setValue={setDateType}
            value={dateType}
            loading={fecthLoading}
            style={{ margin: "10px 0" }}
          />
          <p>Продавец:</p>
          <Select
            value={manager}
            options={managers}
            loading={managersLoading}
            setValue={setManager}
            type={""}
            style={{ margin: "10px 0" }}
          />
          <p>Самовывоз/Доставка:</p>
          <Select
            value={pickup}
            options={pickupOptions}
            setValue={setPickup}
            type={"pickup"}
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
            <p>По дате:</p>
            <Select
              type="dateType"
              options={dateTypesOptions}
              setValue={setDateType}
              value={dateType}
              loading={fecthLoading}
              style={{ margin: "10px 0" }}
            />
            <p>Продавец:</p>
            <Select
              value={manager}
              options={managers}
              loading={managersLoading}
              setValue={setManager}
              type={""}
              style={{ margin: "10px 0" }}
            />
            <p>Самовывоз/Доставка:</p>
            <Select
              value={pickup}
              options={pickupOptions}
              setValue={setPickup}
              type={"pickup"}
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
            style={{ height: "inherit", margin: "15px 0" }}
          >
            <table>
              <thead>
                <tr>
                  <th>Способ оплаты</th>
                  <th>Сумма</th>
                  <th>Комиссия</th>
                </tr>
              </thead>
              <tbody>
                {paymentTotals.map((total) => {
                  return (
                    <tr key={total.id}>
                      <td>{total.name} </td>
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
                        {total.comission} ₸
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div
            className={cl.tableWrapper}
            style={{
              height: "inherit",
              marginTop: 30,
              marginBottom: 30,
              maxHeight: 500,
            }}
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
