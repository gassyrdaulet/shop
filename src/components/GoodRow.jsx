import cl from "../styles/Goods.module.css";
import { BsPencil, BsTrash } from "react-icons/bs";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteGood } from "../api/GoodService";

function GoodRow({ good, index, fetch }) {
  const reference = useRef(null);
  const [listVisible, setListVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (reference.current && !reference.current.contains(event.target)) {
        setListVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [reference]);

  return (
    <tr>
      <td>{index}</td>
      <td>{good.id}</td>
      <td>{good.barcode}</td>
      <td>{good.name}</td>
      <td>{good.price} тг</td>
      <td>{good.purchase} тг</td>
      <td>{good.remainder}</td>
      <td>{good.unit}</td>
      <td>
        <div ref={reference} className={cl.MoreButtonWrapper}>
          <div
            onClick={() => {
              setListVisible(!listVisible);
            }}
            className={cl.MoreButton + " " + (listVisible ? cl.selected : "")}
          >
            <BsPencil />
          </div>
          <div
            className={cl.ButtonsList + " " + (listVisible ? cl.active : "")}
          >
            <div
              className={cl.ListButton}
              onClick={() => navigate("/goods/edit/" + good.id)}
            >
              <BsPencil />
              <p>Редактировать</p>
            </div>
            <div
              className={cl.ListButton}
              onClick={() => {
                if (
                  window.confirm(
                    `Вы уверены что хотите удалить этот товар: ${good.id} ${good.name}?`
                  )
                ) {
                  deleteGood({
                    setDeleteGoodLoading: () => {},
                    id: good.id,
                    update: () => fetch(),
                  });
                }
              }}
            >
              <BsTrash />
              <p>Удалить</p>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default GoodRow;
