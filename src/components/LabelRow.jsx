import cl from "../styles/Goods.module.css";
import { BsTrash } from "react-icons/bs";
import { BsDashSquare, BsPlusSquare } from "react-icons/bs";

function LabelRow({ good, index, setGoods, goods, editable = true, type }) {
  const deleteGood = () => {
    setGoods((prev) => {
      const temp = [...prev].filter((item) => {
        return item.id !== good.id;
      });
      return temp;
    });
  };

  const handleChange = (value, key) => {
    if (!editable) {
      return;
    }
    setGoods((prev) => {
      const temp = [...prev];
      for (let item of temp) {
        if (good.id === item.id) {
          const result = parseInt(value);
          const result2 = isNaN(result) ? 0 : result;
          const result3 = Math.abs(result2);
          good[key] = result3;
          break;
        }
      }
      return temp;
    });
  };

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
        {good.id}
      </td>
      <td>{good.name}</td>
      <td style={{ textAlign: "center" }}>{good.price} тг</td>
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

export default LabelRow;
