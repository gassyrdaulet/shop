import { useState, useEffect, useMemo, useCallback } from "react";
import cl from "../styles/Goods.module.css";
import SpendingRow from "../components/SpendingRow";
import SpendingHeaders from "../components/SpendingHeaders";
import moment from "moment";
import SearchInput from "../components/SearchInput";
import Button from "../components/Button";
import Select from "../components/Select";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import { getSpendings, newSpending } from "../api/OrganizationService";
import { BiCheckCircle, BiPlusCircle } from "react-icons/bi";
import LegendInput from "../components/LegendInput";
import { useNavigate } from "react-router-dom";

function Spendings() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState(-1);
  const [processLoading, setProcessLoading] = useState(false);
  const [newSpendingModal, setNewSpendingModal] = useState(false);
  const [dateTouched, setDateTouched] = useState(false);
  const [firstDate, setFirstDate] = useState(
    moment().startOf("day").subtract(30, "days").format("yyyy-MM-DD")
  );
  const [secondDate, setSecondDate] = useState(
    moment().startOf("day").add(1, "days").format("yyyy-MM-DD")
  );
  const [inputs, setInputs] = useState([
    {
      title: "Назначение",
      value: 12,
      type: "selectpurpose",
      key: "purpose",
    },
    { title: "Сумма", value: "0", type: "input", key: "sum" },
    { title: "Комментарий", value: "", type: "input", key: "comment" },
    {
      title: "Дата",
      value: moment().format("yyyy-MM-DD"),
      type: "input",
      key: "date",
    },
  ]);
  const buttons = [];
  const buttons2 = [
    {
      disabled: processLoading,
      icon: <BiPlusCircle />,
      text: "Добавить",
      onClick: () => {
        setNewSpendingModal(true);
      },
    },
  ];

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
        const result = moment(a.date) < moment(b.date) ? 1 : -1;
        return result;
      });
      return temp;
    } catch (e) {
      console.log("Sort Data Error:", e);
      return [];
    }
  }, [firstSortedData]);

  const purposes = useMemo(() => {
    return [
      { id: 1, name: "Комиссия банка" },
      { id: 2, name: "Коммунальные платежи" },
      { id: 3, name: "Расходники" },
      { id: 4, name: "Штрафы" },
      { id: 5, name: "Маркетинг и реклама" },
      { id: 6, name: "Арендная плата" },
      { id: 7, name: "Интернет" },
      { id: 8, name: "Канц товары" },
      { id: 9, name: "Налоги и сборы" },
      { id: 10, name: "Транспортные расходы" },
      { id: 11, name: "Зар. плата" },
      { id: 12, name: "Прочее" },
    ];
  }, []);

  const purposesRussian = useMemo(() => {
    return {
      bankcomission: "Комиссия банка",
      commpay: "Коммунальные платежи",
      consumables: "Расходники",
      fines: "Штрафы",
      ads: "Маркетинг и реклама",
      rent: "Арендная плата",
      internet: "Интернет",
      stationery: "Канц товары",
      taxes: "Налоги и сборы",
      fare: "Транспортные расходы",
      salary: "Зар. плата",
      other: "Прочее",
    };
  }, []);

  const purposesIds = useMemo(() => {
    return {
      1: "bankcomission",
      2: "commpay",
      3: "consumables",
      4: "fines",
      5: "ads",
      6: "rent",
      7: "internet",
      8: "stationery",
      9: "taxes",
      10: "fare",
      11: "salary",
      12: "other",
    };
  }, []);

  const filteredData = useMemo(() => {
    try {
      if (purpose === -1) {
        return sortedData;
      }
      const temp = sortedData.filter((item) => {
        return purposesIds[purpose] === item.purpose;
      });
      return temp;
    } catch (e) {
      console.log("Sort Data Error:", e);
      return [];
    }
  }, [sortedData, purposesIds, purpose]);

  useEffect(() => {
    getSpendings({
      setProcessLoading,
      setData,
      firstDate: moment()
        .startOf("day")
        .subtract(30, "days")
        .format("yyyy-MM-DD"),
      secondDate: moment().startOf("day").add(1, "days").format("yyyy-MM-DD"),
    });
  }, []);

  const setPurposeForNewSpending = useCallback((value) => {
    setInputs((prev) => {
      const temp = [...prev];
      for (let input of temp) {
        if (input.key === "purpose") {
          input.value = value;
        }
      }
      return temp;
    });
  }, []);

  const handleInputChange = useCallback((key, value) => {
    setInputs((prev) => {
      const temp = [...prev];
      for (let input of temp) {
        if (input.key === key) {
          if (input.key === "date") {
            setDateTouched(true);
          }
          if (input.key === "sum") {
            const parsedValue = parseInt(value);
            const result = isNaN(parsedValue) ? 0 : parsedValue;
            input.value = result;
            return temp;
          }
          input.value = value;
          return temp;
        }
      }
      return temp;
    });
  }, []);

  const handleUpdate = useCallback(() => {
    getSpendings({
      setProcessLoading,
      setData,
      firstDate,
      secondDate,
    });
  }, [firstDate, secondDate]);

  const parsedInput = useMemo(() => {
    const temp = {};
    inputs.forEach((input) => {
      if (input.key === "purpose") {
        temp[input.key] = purposesIds[input.value];
        return;
      }
      if (input.key === "date") {
        temp[input.key] = moment(input.value).valueOf();
        return;
      }
      temp[input.key] = input.value;
    });
    return temp;
  }, [inputs, purposesIds]);

  const total = useMemo(() => {
    try {
      let temp = 0;
      data.forEach((spending) => {
        temp += spending.sum;
      });
      return temp;
    } catch (e) {
      return 0;
    }
  }, [data]);

  const spendingTotals = useMemo(() => {
    try {
      const temp = {};
      data.forEach((spending) => {
        temp[spending.purpose] = temp?.[spending.purpose]
          ? temp[spending.purpose]
          : 0 + spending.sum;
      });
      const result = Object.keys(temp).map((item) => {
        return {
          purpose: purposesRussian[item],
          sum: temp[item],
          percent: (100 * temp[item]) / total,
        };
      });
      result.sort((a, b) => b.sum - a.sum);
      return result;
    } catch (e) {
      return [];
    }
  }, [total, data, purposesRussian]);

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
          <p>Тип расхода</p>
          <Select
            value={purpose}
            setValue={setPurpose}
            options={purposes}
            style={{ margin: 0 }}
            type="managers2"
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
            <p>Тип расхода</p>
            <Select
              value={purpose}
              setValue={setPurpose}
              options={purposes}
              style={{ margin: 0 }}
              type="managers2"
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
          <div
            style={{
              display: "flex",
              width: "100%",
            }}
          >
            <div
              className={cl.tableWrapper}
              style={{
                height: "inherit",
                margin: "15px 0",
                width: "50%",
              }}
            >
              <table>
                <thead>
                  <tr>
                    <th>Назначение</th>
                    <th>Сумма</th>
                    <th>Процент</th>
                  </tr>
                </thead>
                {spendingTotals.length === 0 ? (
                  <tbody style={{ width: "100%", textAlign: "center" }}>
                    <tr>
                      <td colSpan={1000 - 7}>Нет расходов</td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {spendingTotals.map((total) => {
                      return (
                        <tr key={total.purpose}>
                          <td
                            style={{
                              textAlign: "center",
                            }}
                          >
                            {total.purpose}{" "}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                            }}
                          >
                            {total.sum.toFixed(2)} ₸
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                            }}
                          >
                            {total.percent.toFixed(0)} %
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                )}
              </table>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "50%",
                flexDirection: "column",
              }}
            >
              <p style={{ fontSize: 25 }}>Общий расход:</p>
              <p style={{ fontSize: 40 }}>{total.toFixed(2)} ₸</p>
            </div>
          </div>

          <div className={cl.tableWrapper}>
            {processLoading ? (
              <div className={cl.Center}>
                <Loading which="gray" />
              </div>
            ) : (
              <table>
                <thead>
                  <SpendingHeaders />
                </thead>
                {filteredData.length === 0 ? (
                  <tbody style={{ width: "100%", textAlign: "center" }}>
                    <tr>
                      <td colSpan={10}>Доставки не найдены</td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {filteredData.map((spending, index) => {
                      return (
                        <SpendingRow
                          key={spending.id}
                          spending={spending}
                          index={index + 1}
                          purpose={purposesRussian[spending.purpose]}
                          update={() => navigate(0)}
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
        modalVisible={newSpendingModal}
        setModalVisible={setNewSpendingModal}
        noEscape={processLoading}
      >
        <div
          className={cl.tableWrapper}
          style={{ height: "inherit", maxHeight: "50vh" }}
        >
          {inputs.map((input) => {
            if (input.type === "selectpurpose") {
              return (
                <span key={input.key}>
                  <p>{input.title}</p>
                  <Select
                    loading={processLoading}
                    value={input.value}
                    setValue={setPurposeForNewSpending}
                    options={purposes}
                    style={{ margin: 0 }}
                    type=""
                  />
                </span>
              );
            }
            return (
              <LegendInput
                key={input.key}
                type={input.key === "date" ? "date" : "text"}
                value={input.value}
                setValue={(v) => handleInputChange(input.key, v)}
                disabled={processLoading}
                legend={input.title}
              />
            );
          })}
        </div>
        <div className={cl.Center}>
          <Button
            disabled={processLoading}
            text="Сохранить"
            icon={<BiCheckCircle />}
            onClick={() => {
              newSpending({
                setProcessLoading,
                sum: parsedInput.sum,
                comment: parsedInput.comment,
                purpose: parsedInput.purpose,
                date: dateTouched ? parsedInput.date : Date.now(),
                next: () => {
                  navigate(0);
                },
              });
            }}
            style={{ margin: "10px 0" }}
          />
        </div>
      </Modal>
    </div>
  );
}

export default Spendings;
