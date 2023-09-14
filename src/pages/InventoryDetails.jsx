import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { BsArrowLeftCircle } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import LegendInput from "../components/LegendInput";
import AcGoodsHeaders from "../components/AcGoodsHeaders";
import AcGoodRow from "../components/AcGoodRow";
import Loading from "../components/Loading";

import cl from "../styles/Goods.module.css";
import { getInventoryDetails } from "../api/WarehouseService";
import moment from "moment";

function InventoryDetails() {
  const [inventory, setInventory] = useState({
    comment: "",
    id: 0,
    date: "1960-01-01",
    goods: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    getInventoryDetails({ setInventory, setIsLoading, id });
  }, [id]);

  const buttons = [
    {
      icon: <BsArrowLeftCircle />,
      text: "Назад",
      onClick: () => {
        navigate(-1);
      },
    },
  ];
  const buttons2 = [];

  return (
    <div className="pageWrapper">
      <div className={cl.Options}>
        <div className={cl.OptionsButtons}>
          {buttons.map((button) => {
            return (
              <div
                key={button.text}
                onClick={button.onClick}
                className={cl.OptionsButton}
              >
                {button.icon}
                {button.text}
              </div>
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
          <LegendInput
            disabled={true}
            type="date"
            value={moment(inventory.date).format("yyyy-MM-DD")}
            legend="Дата"
          />
          <LegendInput
            disabled={true}
            type="text"
            value={inventory.comment}
            legend="Заметка"
            inputMode="text"
            textarea={true}
            inputStyle={{ minHeight: 180, width: "100%" }}
            maxLength={500}
          />
        </div>
        <div className={cl.secondHalf}>
          <div className={cl.inputsMobile}>
            <LegendInput
              type="date"
              value={moment(inventory.date).format("yyyy-MM-DD")}
              legend="Дата"
              disabled={true}
            />
            <LegendInput
              disabled={true}
              type="text"
              value={inventory.comment}
              legend="Заметка"
              inputMode="text"
              textarea={true}
              inputStyle={{ minHeight: 90, width: "100%" }}
              maxLength={500}
            />
          </div>
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                margin: "25px 0 10px 0",
              }}
            >
              <p style={{ userSelect: "none" }}>Список товаров</p>
              {isLoading ? (
                <div></div>
              ) : (
                <p style={{ userSelect: "none" }}>
                  {inventory.type === "acceptance" ? "Примека" : "Списание"} №«
                  {inventory.id}»
                </p>
              )}
            </div>
            <div className={cl.tableWrapper}>
              {isLoading ? (
                <div className={cl.Center}>
                  <Loading which="gray" />
                </div>
              ) : (
                <table>
                  <thead>
                    <AcGoodsHeaders type={inventory.type} />
                  </thead>
                  {inventory.goods.length === 0 ? (
                    <tbody style={{ width: "100%", textAlign: "center" }}>
                      <tr>
                        <td colSpan={10}>Ничего не найдено</td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {inventory.goods.map((good, index) => {
                        return (
                          <AcGoodRow
                            editable={false}
                            fetch={fetch}
                            key={good.id}
                            good={good}
                            index={index + 1}
                          />
                        );
                      })}
                    </tbody>
                  )}
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryDetails;
