import cl from "../styles/Goods.module.css";
import { useState, useEffect, useMemo } from "react";
import { BsPlusCircle } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import { getInventory } from "../api/WarehouseService";
import InvRow from "../components/InvRow";
import Loading from "../components/Loading";
import SearchInput from "../components/SearchInput";
import moment from "moment";

function Acceptance() {
  const navigate = useNavigate();
  const { type } = useParams();
  const [inventory, setInventory] = useState([]);
  const [isInvLoading, setIsInvLoading] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [firstDate, setFirstDate] = useState(
    moment().subtract(6, "months").format("yyyy-MM-DD")
  );
  const [secondDate, setSecondDate] = useState(moment().format("yyyy-MM-DD"));

  useEffect(() => {
    getInventory({ setInventory, setIsInvLoading, type });
  }, [type]);

  const sortedInventory = useMemo(() => {
    try {
      const sortedArray = [...inventory].sort((a, b) => {
        return -(a.id - b.id);
      });
      return sortedArray;
    } catch (e) {
      return [];
    }
  }, [inventory]);

  const filteredInventoryByIDs = useMemo(() => {
    try {
      const temp = [...sortedInventory].filter((item) =>
        (item.id + "").toLowerCase().includes(searchId.toLowerCase())
      );
      return temp;
    } catch (e) {
      return [];
    }
  }, [sortedInventory, searchId]);

  const filteredInventoryByFirstDate = useMemo(() => {
    try {
      if (!firstDate) {
        return filteredInventoryByIDs;
      }
      const temp = [...filteredInventoryByIDs].filter((item) => {
        return moment(item.date) >= moment(firstDate);
      });
      return temp;
    } catch (e) {
      return [];
    }
  }, [filteredInventoryByIDs, firstDate]);

  const filteredInventoryBySecondDate = useMemo(() => {
    try {
      if (!secondDate) {
        return filteredInventoryByFirstDate;
      }
      const temp = [...filteredInventoryByFirstDate].filter((item) => {
        return moment(item.date) <= moment(secondDate);
      });
      return temp;
    } catch (e) {
      return [];
    }
  }, [filteredInventoryByFirstDate, secondDate]);

  const buttons = [
    {
      icon: <BsPlusCircle />,
      text: type === "acceptance" ? "Создать приемку" : "Создать списание",
      onClick: () => {
        if (type === "acceptance") {
          navigate("/warehouse/new/ac");
        } else {
          navigate("/warehouse/new/wo");
        }
      },
    },
  ];

  return (
    <div className="pageWrapper">
      <div className={cl.Options}>
        <div></div>
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
      </div>
      <div className={cl.goodsWrapper}>
        <div className={cl.groupsWrapper}>
          <div style={{ width: "100%", padding: " 0 10px" }}>
            <SearchInput
              placeholder="Поиск по ID"
              value={searchId}
              setValue={setSearchId}
              className={cl.SearchInput}
            />
            <p>С:</p>
            <SearchInput
              placeholder="с"
              value={firstDate}
              setValue={setFirstDate}
              className={cl.SearchInput}
              type="date"
            />
            <p>До:</p>
            <SearchInput
              placeholder="до"
              value={secondDate}
              setValue={setSecondDate}
              className={cl.SearchInput}
              type="date"
            />
          </div>
        </div>
        <div
          className={cl.TableMainWrapper}
          style={{ backgroundColor: "#f8f8f8" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              margin: "25px 0 10px 20px",
            }}
          >
            <p>Список {`${type === "acceptance" ? "приемок" : "списаний"}`}</p>
            <div></div>
          </div>
          <div className={cl.inputsMobile} style={{ padding: " 0 15px" }}>
            <SearchInput
              placeholder="Поиск по ID"
              value={searchId}
              setValue={setSearchId}
              className={cl.SearchInput}
              inputMode="numeric"
            />
            <p>С:</p>
            <SearchInput
              placeholder="с"
              value={firstDate}
              setValue={setFirstDate}
              className={cl.SearchInput}
              type="date"
            />
            <p>До:</p>
            <SearchInput
              placeholder="до"
              value={secondDate}
              setValue={setSecondDate}
              className={cl.SearchInput}
              type="date"
            />
          </div>
          <div className={cl.tableWrapper}>
            {isInvLoading ? (
              <div className={cl.Center}>
                <Loading which="gray" />
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Тип</th>
                    <th>Комментарий</th>
                    <th>Дата</th>
                    <th>Сумма</th>
                    <th>Количество</th>
                    <th></th>
                  </tr>
                </thead>
                {filteredInventoryBySecondDate.length === 0 ? (
                  <tbody style={{ width: "100%", textAlign: "center" }}>
                    <tr>
                      <td colSpan={10}>Ничего не найдено</td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {filteredInventoryBySecondDate.map((item) => {
                      return <InvRow key={item.id} inventoryItem={item} />;
                    })}
                  </tbody>
                )}
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Acceptance;
