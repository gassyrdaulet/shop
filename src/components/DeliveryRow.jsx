import cl from "../styles/Goods.module.css";
import { BsEye } from "react-icons/bs";
import moment from "moment";
import { useMemo } from "react";

function DeliveryRow({ delivery, index, setDeliveryList }) {
  const paymentsSums = useMemo(() => {
    let temp = 0;
    delivery.deliveries.forEach((item) => {
      temp += isNaN(parseInt(item.paymentSum)) ? 0 : parseInt(item.paymentSum);
    });
    return temp;
  }, [delivery]);

  return (
    <tr>
      <td
        style={{ maxWidth: 25, width: 25, minWidth: 25, textAlign: "center" }}
      >
        {index}
      </td>
      <td
        style={{ maxWidth: 25, width: 25, minWidth: 25, textAlign: "center" }}
      >
        {delivery.id}
      </td>
      <td style={{ textAlign: "center" }}>
        {moment(delivery.date).format("DD.MM.yyyy HH:mm")}
      </td>
      <td>{delivery.comment}</td>
      <td style={{ textAlign: "center" }}>
        {delivery.deliver + ` (ID: ${delivery.deliverId})`}
      </td>
      <td>{delivery.deliveries.length} шт.</td>
      <td style={{ textAlign: "center" }}>{paymentsSums} тг</td>
      <td style={{ textAlign: "center" }}>
        {delivery?.cash ? delivery.cash : 0} тг
      </td>
      <td>
        <div className={cl.MoreButtonWrapper} onClick={setDeliveryList}>
          <div className={cl.MoreButton}>
            <BsEye />
          </div>
        </div>
      </td>
    </tr>
  );
}

export default DeliveryRow;
