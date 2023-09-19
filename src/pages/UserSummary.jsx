import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import cl from "../styles/Goods.module.css";
import SearchInput from "../components/SearchInput";
import Select from "../components/Select";
import Button from "../components/Button";
import { getManagers } from "../api/OrganizationService";

function UserSummary() {
  const navigate = useNavigate();
  const [fecthLoading, setFetchLoading] = useState(false);
  const [firstDate, setFirstDate] = useState(
    moment().startOf("day").format("yyyy-MM-DD")
  );
  const [secondDate, setSecondDate] = useState(
    moment().startOf("day").add(1, "days").format("yyyy-MM-DD")
  );
  const [managers, setManagers] = useState([]);
  const [manager, setManager] = useState(localStorage.getItem("id"));
  const [managersLoading, setManagersLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const buttons = [];
  const buttons2 = [];

  useEffect(() => {
    getManagers({ setManagers, setManagersLoading });
  }, []);

  return (
    <div className="pageWrapper">
      <div className={cl.Options}>
        <div className={cl.OptionsButtons}>
          {buttons.map((button) => {
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
          <p>Продавец:</p>
          <Select
            value={manager}
            options={managers}
            loading={managersLoading}
            setValue={setManager}
            type={"managers"}
            style={{ margin: "10px 0" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div></div>
            <Button text="Применить" />
          </div>
        </div>
        <div className={cl.secondHalf}>
          <div className={cl.inputsMobile}>
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
            <p>Продавец:</p>
            <Select
              value={manager}
              options={managers}
              loading={managersLoading}
              setValue={setManager}
              type={"managers"}
              style={{ margin: "10px 0" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div></div>
              <Button text="Применить" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserSummary;
