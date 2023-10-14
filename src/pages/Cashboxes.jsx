import { useState, useEffect, useMemo, useCallback } from "react";
import cl from "../styles/Goods.module.css";
import CashboxesRow from "../components/CashboxesRow";
import CashboxesHeaders from "../components/CashboxesHeaders";
import moment from "moment";
import SearchInput from "../components/SearchInput";
import Button from "../components/Button";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import { getCashboxes } from "../api/OrganizationService";
import Select from "../components/Select";
import { getOrgInfo } from "../api/OrganizationService";

function Cashboxes() {
  const [data, setData] = useState([]);
  const [manager, setManager] = useState(-1);
  const [cashboxPayments, setCashboxPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [processLoading, setProcessLoading] = useState(false);
  const [moreInfoAboutCashboxModal, setMoreInfoAboutCashboxModal] =
    useState(false);
  const [firstDate, setFirstDate] = useState(
    moment().startOf("day").subtract(30, "days").format("yyyy-MM-DD")
  );
  const [secondDate, setSecondDate] = useState(
    moment().startOf("day").add(1, "days").format("yyyy-MM-DD")
  );
  const buttons = [];
  const buttons2 = [];

  const firstSortedData = useMemo(() => {
    try {
      const temp = [...data].sort((a, b) => {
        return (a.id + "").localeCompare(b.id + "");
      });
      return temp;
    } catch (e) {
      console.log("Sort Data Error:", e);
      return [];
    }
  }, [data]);

  const sortedData = useMemo(() => {
    try {
      const temp = [...firstSortedData].sort((a, b) => {
        const result = moment(a.openeddate) < moment(b.openeddate) ? 1 : -1;
        return result;
      });
      return temp;
    } catch (e) {
      console.log("Sort Data Error:", e);
      return [];
    }
  }, [firstSortedData]);

  const managers = useMemo(() => {
    const temp = [];
    for (let item of data) {
      let found = false;
      for (let name of temp) {
        if (item.username === name) {
          found = true;
          break;
        }
      }
      if (!found) {
        temp.push(item.username);
      }
    }
    const result = temp.map((item, index) => {
      return { id: index + 1, name: item };
    });
    return result;
  }, [data]);

  const filteredData = useMemo(() => {
    try {
      if (manager === -1) {
        return sortedData;
      }
      const temp = sortedData.filter((item) => {
        return managers[manager - 1].name === item.username;
      });
      return temp;
    } catch (e) {
      console.log("Sort Data Error:", e);
      return [];
    }
  }, [sortedData, managers, manager]);

  const paymentMethodsRussian = useMemo(() => {
    const temp = {};
    paymentMethods.forEach((item) => {
      temp[item.code] = item.name;
    }, []);
    return temp;
  }, [paymentMethods]);

  const operationTypes = useMemo(() => {
    return {
      sale: "Продажа",
      remove: "Снятие",
      add: "Внесение",
    };
  }, []);

  useEffect(() => {
    getCashboxes({
      setProcessLoading,
      setData,
      firstDate: moment()
        .startOf("day")
        .subtract(30, "days")
        .format("yyyy-MM-DD"),
      secondDate: moment().startOf("day").add(1, "days").format("yyyy-MM-DD"),
    });
    getOrgInfo({
      setFetchLoading: setPaymentsLoading,
      setData: () => {},
      setValue: (key, v) => {
        if (key === "paymentMethods") {
          setPaymentMethods(v);
        }
      },
    });
  }, []);

  useEffect(() => {
    if (moreInfoAboutCashboxModal === false) {
      setCashboxPayments([]);
    }
  }, [moreInfoAboutCashboxModal]);

  const handleUpdate = useCallback(() => {
    getCashboxes({
      setProcessLoading,
      setData,
      firstDate,
      secondDate,
    });
  }, [firstDate, secondDate]);

  const cashboxInfoTotal = useMemo(() => {
    let temp = 0;
    cashboxPayments?.cash?.forEach((payment) => {
      temp += payment.amount;
    });
    return temp;
  }, [cashboxPayments]);

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
            isDate={true}
            setValue={setFirstDate}
            className={cl.SearchInput}
            type="date"
          />
          <p>До:</p>
          <SearchInput
            placeholder="до"
            isDate={true}
            value={secondDate}
            setValue={setSecondDate}
            className={cl.SearchInput}
            type="date"
          />
          <p>Кассир</p>
          <Select
            value={manager}
            setValue={setManager}
            options={managers}
            style={{ margin: 0 }}
            type="managers"
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <div></div>
            <Button onClick={handleUpdate} text="Применить" />
          </div>
        </div>
        <div className={cl.secondHalf}>
          <div className={cl.inputsMobile}>
            <p>С:</p>
            <SearchInput
              placeholder="с"
              value={firstDate}
              isDate={true}
              setValue={setFirstDate}
              className={cl.SearchInput}
              type="date"
            />
            <p>До:</p>
            <SearchInput
              placeholder="до"
              isDate={true}
              value={secondDate}
              setValue={setSecondDate}
              className={cl.SearchInput}
              type="date"
            />
            <p>Кассир</p>
            <Select
              value={manager}
              setValue={setManager}
              options={managers}
              style={{ margin: 0 }}
              type="managers"
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 10,
                marginBottom: 20,
              }}
            >
              <div></div>
              <Button onClick={handleUpdate} text="Применить" />
            </div>
          </div>
          <div className={cl.tableWrapper}>
            {processLoading || paymentsLoading ? (
              <div className={cl.Center}>
                <Loading which="gray" />
              </div>
            ) : (
              <table>
                <thead>
                  <CashboxesHeaders />
                </thead>
                {filteredData.length === 0 ? (
                  <tbody style={{ width: "100%", textAlign: "center" }}>
                    <tr>
                      <td colSpan={10}>Нет касс</td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {filteredData.map((cashbox, index) => {
                      return (
                        <CashboxesRow
                          key={cashbox.id}
                          cashbox={cashbox}
                          index={index + 1}
                          onClick={() => {
                            setCashboxPayments(cashbox);
                            setMoreInfoAboutCashboxModal(true);
                          }}
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
      <Modal
        modalVisible={moreInfoAboutCashboxModal}
        setModalVisible={setMoreInfoAboutCashboxModal}
        noEscape={processLoading}
      >
        <div
          className={cl.tableWrapper}
          style={{ height: "inherit", maxHeight: "50vh" }}
        >
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Дата</th>
                <th>Источник</th>
                <th>Сумма</th>
                <th>Метод оплаты</th>
                <th>Комментарий</th>
              </tr>
            </thead>
            <tbody>
              {cashboxPayments?.length === 0 ? (
                <tr>
                  <td style={{ textAlign: "center" }} colSpan={1000 - 7}>
                    Нет операций
                  </td>
                </tr>
              ) : (
                cashboxPayments?.cash?.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td
                        style={{
                          width: "inherit",
                          maxWidth: "inherit",
                          minWidth: "100px",
                        }}
                      >
                        {moment(item.date).format("DD.MM.yyyy HH:mm")}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {operationTypes?.[item.type]
                          ? operationTypes[item.type]
                          : item.type}
                      </td>
                      <td
                        style={{
                          width: "inherit",
                          maxWidth: "inherit",
                          minWidth: "100px",
                          textAlign: "center",
                        }}
                      >
                        {item.amount} тг
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {paymentMethodsRussian?.[item.method]
                          ? paymentMethodsRussian?.[item.method]
                          : item.method}
                      </td>
                      <td style={{ textAlign: "center" }}>{item.comment}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr>
                <td
                  style={{
                    textAlign: "center",
                    width: "inherit",
                    maxWidth: "inherit",
                    minWidth: "50px",
                  }}
                >
                  {cashboxPayments?.cash?.length} шт.
                </td>
                <td
                  colSpan={1000 - 7}
                  style={{
                    textAlign: "center",
                    width: "inherit",
                    maxWidth: "inherit",
                    minWidth: "50px",
                  }}
                >
                  {cashboxInfoTotal} тг
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className={cl.Center}></div>
      </Modal>
    </div>
  );
}

export default Cashboxes;
