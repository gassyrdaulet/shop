import cl from "../styles/Goods.module.css";
import { BsTrash } from "react-icons/bs";

function NoPaymentRow({
  paymentItem,
  index,
  setPayment,
  payment,
  editable = true,
  setFocusedInput = () => {},
  paymentMethods,
}) {
  const deletePayment = () => {
    const temp = payment.filter((item) => {
      return item.id !== paymentItem.id;
    });
    setPayment(temp);
  };

  const handleChange = (value, key) => {
    if (!editable) {
      return;
    }
    const temp = [...payment];
    for (let item of temp) {
      if (paymentItem.id === item.id) {
        const value2 = (value + "").startsWith("0")
          ? (value + "").replace("0", "") === ""
            ? 0
            : (value + "").replace("0", "")
          : value + "";
        const result = parseInt(
          (value2 + "").replace(/^0{2,}|^0.|[^0-9/]/gim, "").substring(0, 7)
        );
        const result2 = isNaN(result) ? 0 : result;
        if (key === "sum") {
          item[key] = result2;
        } else if (key === "method") {
          item[key] = value;
        } else {
          if (value < 0) {
            return;
          }
          item[key] = result2;
          break;
        }
      }
      setPayment(temp);
    }
  };

  return (
    <tr>
      <td>{index}</td>
      <td style={{ minWidth: 120 }}>
        <select
          value={paymentItem.method}
          style={{ height: "25px" }}
          onChange={({ target }) => {
            handleChange(target.value, "method");
          }}
        >
          {paymentMethods.map((method) => {
            return (
              <option key={method.id} value={method.code}>
                {method.name}
              </option>
            );
          })}
        </select>
      </td>
      <td>
        <div className={cl.MoreButtonWrapper}>
          <input
            onFocus={() => {
              setFocusedInput(paymentItem.id);
            }}
            disabled={!editable}
            onChange={({ target }) => {
              handleChange(target.value, "sum");
            }}
            value={paymentItem.sum}
            type="text"
            inputMode="numeric"
            style={{
              width: "80%",
              minWidth: "50px",
              height: "25px",
              textAlign: "end",
              padding: " 2px 5px",
            }}
          />
        </div>
      </td>
      <td style={{ minWidth: 60 }}>
        <div className={cl.MoreButtonWrapper}>
          {editable ? (
            <div onClick={deletePayment} className={cl.MoreButton}>
              <BsTrash color="red" />
            </div>
          ) : (
            ""
          )}
        </div>
      </td>
    </tr>
  );
}

export default NoPaymentRow;
