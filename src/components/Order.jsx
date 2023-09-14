import { useMemo } from "react";
import moment from "moment";
import { BiCheckbox, BiCheckboxChecked } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import TextButton from "./TextButton";

function Order({ order, checked, handleMark, status, dateType, orderStatus }) {
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

  return (
    <tr
      style={{
        backgroundColor: checked
          ? "#58cf99"
          : order.status === "cancelled"
          ? "#cd8faa"
          : "",
      }}
      onClick={() => handleMark(order.id)}
    >
      <td>
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {checked ? <BiCheckboxChecked size={32} /> : <BiCheckbox size={32} />}
        </div>
      </td>
      <td style={{ minWidth: 150 }}>
        {goodsParsed}
        <TextButton
          text="Подробнее"
          onClick={() => navigate("/orders/details/" + order.id)}
        />
      </td>
      <td style={{ textAlign: "center" }}>{sumWithDiscount} тг</td>
      <td style={{ textAlign: "center" }}>{order.author}</td>
      <td style={{ textAlign: "center" }}>{order.deliver}</td>
      <td style={{ minWidth: 150, wordBreak: "break-all", textAlign: "start" }}>
        {order.deliveryinfo.address}
      </td>
      <td style={{ textAlign: "start" }}>{order.comment}</td>
      <td style={{ textAlign: "center" }}>
        {status === "archive"
          ? moment(order[dateType]).format("DD.MM.yyyy HH:mm")
          : moment(order.creationdate).format("DD.MM.yyyy HH:mm")}
      </td>
      <td style={{ textAlign: "center" }}>
        {orderStatus ? `${orderStatus}` : ""}
      </td>
    </tr>
  );
}

export default Order;
