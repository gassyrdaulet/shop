import { useMemo } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import TextButton from "./TextButton";

function Order({
  index,
  order,
  checked,
  handleMark,
  status,
  dateType,
  orderStatus,
}) {
  const navigate = useNavigate();

  const sum = useMemo(() => {
    try {
      const { goods, deliveryinfo } = order;
      let tempSum = 0;
      goods.forEach(
        (good) =>
          (tempSum +=
            good.quantity * good.price -
            (good.discount.type === "percent"
              ? ((good.price * good.discount.amount) / 100) * good.quantity
              : good.discount.amount * good.quantity))
      );
      const deliveryPrice = parseInt(deliveryinfo["deliveryPriceForCustomer"]);
      tempSum += isNaN(deliveryPrice) ? 0 : deliveryPrice;
      return tempSum;
    } catch (e) {
      console.log(e);
      return 0;
    }
  }, [order]);

  const sumWithDiscount = useMemo(() => {
    try {
      const { discount } = order;
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
  }, [order, sum]);

  const goodsParsed = useMemo(() => {
    const { goods } = order;
    let parsedString = "";
    for (let good of goods) {
      parsedString += `${good.quantity}шт. ${good.name}; `;
    }
    return parsedString;
  }, [order]);

  const backgroundColor = useMemo(() => {
    if (checked) {
      return "#58cf99";
    }
    if (order.status === "cancelled" || order.status === "returned") {
      return "#cd8faa";
    } else if (order.status === "finished" && order.wasReturned === 1) {
      return "#cdcdaa";
    } else {
      return "";
    }
  }, [order, checked]);

  return (
    <tr style={{ backgroundColor }} onClick={() => handleMark(order.id)}>
      <td style={{ textAlign: "center" }}>{index + 1}</td>
      <td style={{ minWidth: 150 }}>
        {goodsParsed}
        <TextButton
          text="Подробнее"
          onClick={() => navigate("/orders/details/" + order.id)}
        />
      </td>
      <td style={{ textAlign: "center" }}>{sumWithDiscount} тг</td>
      <td style={{ textAlign: "center" }}>
        {order.author ? order.author : "-"}
      </td>
      <td style={{ textAlign: "start" }}>{order.comment}</td>
      <td style={{ textAlign: "center" }}># {order.id}</td>
      <td style={{ textAlign: "center" }}>
        {status === "archive"
          ? moment(order[dateType]).format("DD.MM.yyyy HH:mm")
          : moment(order.creationdate).format("DD.MM.yyyy HH:mm")}
      </td>
      <td style={{ textAlign: "center" }}>{orderStatus}</td>
    </tr>
  );
}

export default Order;
