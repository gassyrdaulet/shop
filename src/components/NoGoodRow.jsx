import cl from "../styles/Goods.module.css";
import { BsTrash } from "react-icons/bs";
import { BsDashSquare, BsPlusSquare } from "react-icons/bs";

function NoGoodRow({ good, index, setGoods, goods, editable = true }) {
  const deleteGood = () => {
    const temp = goods.filter((item) => {
      return item.id !== good.id;
    });
    setGoods(temp);
  };

  const handleChange = (value, key) => {
    if (!editable) {
      return;
    }
    const temp = [...goods];
    for (let item of goods) {
      if (good.id === item.id) {
        const value2 = (value + "").startsWith("0")
          ? (value + "").replace("0", "") === ""
            ? 0
            : (value + "").replace("0", "")
          : value + "";
        const result = parseInt(
          (value2 + "").replace(/^0{2,}|^0.|[^0-9/]/gim, "").substring(0, 7)
        );
        const result2 = isNaN(result) ? 0 : result;
        if (key === "discount.amount") {
          good["discount"].amount = result2 > 10000 ? 10000 : result2;
        } else if (key === "discount.type") {
          good["discount"].type = value;
        } else {
          if (value < 0) {
            return;
          }
          good[key] = result2 > good.remainder ? good.remainder : result2;
        }
        break;
      }
    }
    setGoods(temp);
  };

  return (
    <tr>
      <td>{index}</td>
      <td>{good.name}</td>
      <td>{good.price}</td>
      <td>
        <div className={cl.MoreButtonWrapper}>
          <BsDashSquare
            size={25}
            style={{ cursor: "pointer", minWidth: "30%" }}
            onClick={() =>
              handleChange(parseInt(good.quantity) - 1, "quantity")
            }
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <input
              disabled={!editable}
              value={good.quantity}
              onChange={({ target }) => handleChange(target.value, "quantity")}
              type="text"
              inputMode="numeric"
              style={{
                width: "100%",
                textAlign: "center",
                padding: " 2px 5px",
                fontSize: 10,
                height: "25px",
              }}
            />
            <p
              style={{
                fontSize: 10,
                textAlign: "center",
                marginTop: 5,
                userSelect: "none",
              }}
            >
              {good.remainder ? `Остаток: ${good.remainder}` : ""}
            </p>
          </div>
          <BsPlusSquare
            size={25}
            style={{ cursor: "pointer", minWidth: "30%" }}
            onClick={() =>
              handleChange(parseInt(good.quantity) + 1, "quantity")
            }
          />
        </div>
      </td>
      <td>
        <div className={cl.MoreButtonWrapper}>
          <input
            disabled={!editable}
            onChange={({ target }) =>
              handleChange(target.value, "discount.amount")
            }
            value={good.discount.amount}
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
          <select
            value={good.discount.type}
            style={{ height: "25px" }}
            onChange={({ target }) => {
              handleChange(target.value, "discount.type");
            }}
          >
            <option value="percent">%</option>
            <option value="KZT">тг</option>
          </select>
        </div>
      </td>
      <td
        style={{
          userSelect: "none",
        }}
      >
        {good.price * good.quantity -
          (good.discount.type === "percent"
            ? ((good.price * good.discount.amount) / 100) * good.quantity
            : good.discount.amount * good.quantity)}{" "}
        тг
      </td>
      <td>
        <div className={cl.MoreButtonWrapper}>
          {editable ? (
            <div onClick={deleteGood} className={cl.MoreButton}>
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

export default NoGoodRow;
