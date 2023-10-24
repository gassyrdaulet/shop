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
import { getFinishedOrdersForSummary as getFinishedOrders } from "../api/OrderService";
import Loading from "../components/Loading";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
  PieChart,
  Pie,
  Sector,
} from "recharts";

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >{`${value} тг`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

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
  const [activeIndex, setActiveIndex] = useState(0);
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
    const fdate = moment().startOf("day").format("yyyy-MM-DD");
    const sdate = moment().startOf("day").add(1, "days").format("yyyy-MM-DD");
    setFirstDate(fdate);
    setSecondDate(sdate);
    setSelectedDates({ firstDate: fdate, secondDate: sdate });
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
        const kaspiInfo = order?.kaspiinfo;
        const kaspiInfoObject = kaspiInfo ? Object.keys(kaspiInfo) : [];
        const isKaspi = kaspiInfoObject ? kaspiInfoObject.length > 0 : false;
        return (
          (order.status === "finished" || order.status === "returned") &&
          order.countable === 1 &&
          !isKaspi
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
    const dateDifference = moment(selectedDates.secondDate).diff(
      moment(selectedDates.firstDate),
      "days"
    );
    const orders = filteredOrdersByManager;
    let totalSum = 0;
    let totalPurchaseSum = 0;
    let paymentComission = 0;
    let returnedOrders = 0;
    orders.forEach((order) => {
      let orderSum = 0;
      let purchaseSum = 0;
      let discountSum = 0;
      let orderDiscountSum = 0;
      let sum = 0;
      let orderPaymentComission = 0;
      const { status } = order;
      if (status === "returned") {
        returnedOrders++;
      }
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
        if (parseInt(good.purchase) < 10) {
          console.log(
            "Внимание! Найден товар с нулевым закупом:",
            "#" + order.id,
            good.price + "тг",
            moment(order.creationdate).format("DD.MM.YYYY HH:mm"),
            good.name,
            good.id
          );
        }
      });
      sum = orderSum - discountSum;
      orderDiscountSum =
        order.discount.type === "KZT"
          ? parseInt(order.discount.amount)
          : (sum * order.discount.amount) / 100;
      totalSum =
        totalSum + (status === "returned" ? -1 : 1) * (sum - orderDiscountSum);
      const one = {};
      order.payment.forEach((payment) => {
        if (!one[payment.method]) {
          one[payment.method] =
            (status === "returned" ? -1 : 1) * parseInt(payment.sum);
        } else {
          one[payment.method] +=
            (status === "returned" ? -1 : 1) * parseInt(payment.sum);
        }
      });
      totalPurchaseSum =
        totalPurchaseSum + (status === "returned" ? -1 : 1) * purchaseSum;
      paymentComission =
        paymentComission + (status === "returned") ? 0 : orderPaymentComission;
    });
    return [
      {
        text: "Реализовано:",
        sum: totalSum.toFixed(2) + "  ₸",
        average: (totalSum / dateDifference).toFixed(2) + "  ₸",
      },
      {
        text: "Прибыль:",
        sum:
          (totalSum - totalPurchaseSum - paymentComission).toFixed(2) + "  ₸",
        average:
          (
            (totalSum - totalPurchaseSum - paymentComission) /
            dateDifference
          ).toFixed(2) + "  ₸",
      },
      {
        text: "Всего продаж:",
        sum: orders.length - returnedOrders + " шт.",
        average:
          ((orders.length - returnedOrders) / dateDifference).toFixed(2) +
          " шт.",
      },
      {
        text: "Возвраты:",
        sum: returnedOrders + " шт.",
        average: (returnedOrders / dateDifference).toFixed(2) + " шт.",
      },
    ];
  }, [filteredOrdersByManager, paymentMethods, selectedDates]);

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
        if (
          moment(order[dateTypes[dateType]]).isSame(moment(item.date), "day")
        ) {
          item.orders.push(order);
          break;
        }
      }
    });
    temp.forEach((day) => {
      let totalSum = 0;
      let totalPurchaseSum = 0;
      let paymentComission = 0;
      let returnedOrders = 0;
      day.orders.forEach((order) => {
        const { status } = order;
        if ((status === "returned") === 0) {
          returnedOrders++;
        }
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
        totalSum =
          totalSum +
          (status === "returned" ? -1 : 1) * (sum - orderDiscountSum);
        totalPurchaseSum =
          totalPurchaseSum + (status === "returned" ? -1 : 1) * purchaseSum;
        paymentComission =
          paymentComission + (status === "returned")
            ? 0
            : orderPaymentComission;
      });
      day.sum = totalSum;
      day.profit = totalSum - totalPurchaseSum - paymentComission;
      day.sales = day.orders.length - returnedOrders;
      day.returnedOrders = returnedOrders;
    });
    return temp;
  }, [
    selectedDates,
    filteredOrdersByManager,
    paymentMethods,
    dateTypes,
    dateType,
  ]);

  const paymentTotals = useMemo(() => {
    try {
      const orders = filteredOrdersByManager;
      const temp = {};
      const final = [];
      orders.forEach((order) => {
        if (order.status === "cancelled") {
          return;
        }
        const isReturnedOrder = order.status === "returned";
        order.payment.forEach((payment) => {
          if (!temp[payment.method]) {
            temp[payment.method] =
              (isReturnedOrder ? -1 : 1) * parseInt(payment.sum);
          } else {
            temp[payment.method] +=
              (isReturnedOrder ? -1 : 1) * parseInt(payment.sum);
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
          value: temp[key],
        });
      });
      final.sort((a, b) => b.value - a.value);
      return final;
    } catch (e) {
      console.log("Payment Totals Error:", e);
      return [];
    }
  }, [filteredOrdersByManager, paymentMethodNames, paymentMethods]);

  const handleUpdate = useCallback(() => {
    getFinishedOrders({
      setFinishedOrdersLoading: setFetchLoading,
      setFinishedOrders: setOrders,
      firstDate,
      secondDate,
      dateType: dateTypes[dateType],
      delivery: null,
      next: () => {
        setSelectedDates({ firstDate, secondDate });
      },
    });
  }, [firstDate, secondDate, dateTypes, dateType]);

  const chartData = useMemo(() => {
    const temp = totalsByDays
      .map((item) => {
        const average = Math.floor(item.sum / item.sales);
        return {
          date: moment(item.date).format("DD.MM.yyyy"),
          profit: item.profit,
          sum: item.sum,
          average: isNaN(average) ? 0 : average,
        };
      })
      .reverse();
    return temp;
  }, [totalsByDays]);

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
                    <p style={{ fontSize: 14 }}>{total.average}</p>
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
            className={cl.HideScroll}
            style={{
              maxWidth: "100%",
              width: "100%",
              display: "flex",
              margin: "10px 0",
              overflow: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <LineChart
                width={window.innerWidth < 800 ? 400 : 550}
                height={window.innerWidth < 800 ? 200 : 275}
                data={chartData}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis dataKey="sum" yAxisId="left" />
                <YAxis dataKey="average" yAxisId="right" orientation="right" />
                <Legend />
                <Tooltip />
                <Line
                  type="monotone"
                  yAxisId="left"
                  dataKey="sum"
                  stroke="#cd2424"
                  name="Сумма продаж"
                />
                <Line
                  type="monotone"
                  yAxisId="left"
                  dataKey="profit"
                  stroke="#24cd24"
                  name="Прибыль"
                />
                <Line
                  type="monotone"
                  yAxisId="right"
                  dataKey="average"
                  stroke="#2424cd"
                  name="Средний чек"
                />
              </LineChart>
              <PieChart width={500} height={500}>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={paymentTotals}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={(_, index) => {
                    setActiveIndex(index);
                  }}
                />
              </PieChart>
            </div>
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
                  <th>Возвраты</th>
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
                        {total.sales} шт.
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        {total.returnedOrders} шт.
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
