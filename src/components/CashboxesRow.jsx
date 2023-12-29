import moment from "moment";
import { BsEye } from "react-icons/bs";
import { useMemo } from "react";
import cl from "../styles/Goods.module.css";

function CashboxesRow({ cashbox, index, onClick }) {
  const sum = useMemo(() => {
    try {
      if (!cashbox?.cash) {
        return 0;
      }
      let tempSum = 0;
      cashbox.cash.forEach((item) => {
        if (item.method === "cash") {
          tempSum += item.amount;
        }
      });
      return tempSum;
    } catch (e) {
      console.log("Cashbox Sum Error:", e);
      return 0;
    }
  }, [cashbox]);

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
        {cashbox.id}
      </td>
      <td style={{ textAlign: "center" }}>
        {moment(cashbox.openeddate).format("DD.MM.yyyy HH:mm")}
      </td>
      <td style={{ textAlign: "center" }}>
        {cashbox.closeddate
          ? moment(cashbox.closeddate).format("DD.MM.yyyy HH:mm")
          : "-"}
      </td>
      <td style={{ textAlign: "center" }}>
        {cashbox.username + ` (ID: ${cashbox.responsible})`}
      </td>
      <td>{(isNaN(parseInt(sum)) ? 0 : parseInt(sum)).toFixed(2)} тг.</td>
      <td>
        <div className={cl.MoreButtonWrapper} onClick={onClick}>
          <div className={cl.MoreButton}>
            <BsEye />
          </div>
        </div>
      </td>
    </tr>
  );
}

export default CashboxesRow;
