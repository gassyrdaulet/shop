import { useState, useEffect, useMemo, useCallback } from "react";
import cl from "../styles/Goods.module.css";
import { getDeliveryLists } from "../api/OrderService";
import DeliveryRow from "../components/DeliveryRow";
import DeliveryHeaders from "../components/DeliveryHeaders";
import moment from "moment";
import SearchInput from "../components/SearchInput";
import Button from "../components/Button";
import Select from "../components/Select";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import { BiCheckCircle } from "react-icons/bi";
import { BsEyeSlashFill } from "react-icons/bs";

function DeliveryLists() {
  const [data, setData] = useState([]);
  const [deliveryList, setDeliveryList] = useState({ deliveries: [] });
  const [deliver, setDeliver] = useState(-1);
  const [processLoading, setProcessLoading] = useState(false);
  const [deliveryDetailsModal, setDeliveryDetailsModal] = useState(false);
  const [firstDate, setFirstDate] = useState(
    moment().startOf("day").subtract(30, "days").format("yyyy-MM-DD")
  );
  const [secondDate, setSecondDate] = useState(
    moment().startOf("day").add(1, "days").format("yyyy-MM-DD")
  );
  const buttons = [];
  const buttons2 = [];

  const sortedDeliveries = useMemo(() => {
    try {
      const temp = [...data].sort((a, b) => {
        const result = moment(a.date) < moment(b.date) ? 1 : -1;
        return result;
      });
      return temp;
    } catch (e) {
      console.log("Sort Data Error:", e);
      return [];
    }
  }, [data]);

  const delivers = useMemo(() => {
    const temp = [];
    for (let item of data) {
      let found = false;
      for (let name of temp) {
        if (item.deliver === name) {
          found = true;
          break;
        }
      }
      if (!found) {
        temp.push(item.deliver);
      }
    }
    const result = temp.map((item, index) => {
      return { id: index + 1, name: item };
    });
    return result;
  }, [data]);

  const filteredData = useMemo(() => {
    try {
      if (deliver === -1) {
        return sortedDeliveries;
      }
      const temp = sortedDeliveries.filter((item) => {
        return delivers[deliver - 1].name === item.deliver;
      });
      return temp;
    } catch (e) {
      console.log("Sort Data Error:", e);
      return [];
    }
  }, [sortedDeliveries, delivers, deliver]);

  const statusesRussian = useMemo(() => {
    return {
      processing: "На обработке",
      awaiting: "Ожидает выдачи",
      returned: "Возвращен",
      cancelled: "Отменен",
      finished: "Завершен",
    };
  }, []);

  const payoffDeliveriesSum = useMemo(() => {
    if (deliveryList.length === 0) {
      return undefined;
    }
    let paymentSums = 0;
    let orderSums = 0;
    let deliveryCosts = 0;
    let countableSum = 0;
    let cancelledSum = 0;
    deliveryList.deliveries.forEach((item) => {
      if (item.status === "cancelled") {
        cancelledSum++;
        return;
      }
      paymentSums += parseInt(item.paymentSum);
      countableSum += item.countable ? 1 : 0;
      orderSums += parseInt(item.sum);
      deliveryCosts += parseInt(item.deliveryPay);
    });
    return {
      orderSums,
      deliveryCosts,
      countableSum,
      paymentSums,
      cancelledSum,
    };
  }, [deliveryList]);

  useEffect(() => {
    getDeliveryLists({
      setProcessLoading,
      setData,
      firstDate: moment()
        .startOf("day")
        .subtract(30, "days")
        .format("yyyy-MM-DD"),
      secondDate: moment().startOf("day").add(1, "days").format("yyyy-MM-DD"),
    });
  }, []);

  useEffect(() => {
    if (deliveryDetailsModal === false) {
      setDeliveryList([]);
    }
  }, [deliveryDetailsModal]);

  const handleUpdate = useCallback(() => {
    getDeliveryLists({
      setProcessLoading,
      setData,
      firstDate,
      secondDate,
    });
  }, [firstDate, secondDate]);

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
          <p>Курьер</p>
          <Select
            value={deliver}
            setValue={setDeliver}
            options={delivers}
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
            <p>Курьер</p>
            <Select
              value={deliver}
              setValue={setDeliver}
              options={delivers}
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
            {processLoading ? (
              <div className={cl.Center}>
                <Loading which="gray" />
              </div>
            ) : (
              <table>
                <thead>
                  <DeliveryHeaders />
                </thead>
                {filteredData.length === 0 ? (
                  <tbody style={{ width: "100%", textAlign: "center" }}>
                    <tr>
                      <td colSpan={10}>Доставки не найдены</td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {filteredData.map((delivery, index) => {
                      return (
                        <DeliveryRow
                          key={delivery.id}
                          delivery={delivery}
                          index={index + 1}
                          setDeliveryList={() => {
                            setDeliveryList(delivery);
                            setDeliveryDetailsModal(true);
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
        modalVisible={deliveryDetailsModal}
        setModalVisible={setDeliveryDetailsModal}
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
                <th>Входит в отчет</th>
                <th>Адрес</th>
                <th>Товар</th>
                <th>Статус</th>
                <th>Стоимость доставки</th>
                <th>Сумма заказа</th>
                <th>Курьер принял</th>
              </tr>
            </thead>
            <tbody>
              {deliveryList?.deliveries?.length === 0 ? (
                <tr>
                  <td style={{ textAlign: "center" }} colSpan={1000 - 7}>
                    Нет Доставок
                  </td>
                </tr>
              ) : (
                deliveryList?.deliveries?.map((item, index) => {
                  return (
                    <tr
                      style={{
                        backgroundColor:
                          item.status === "cancelled" ? "#cd8faa" : "",
                      }}
                      key={item.id}
                    >
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td
                        style={{
                          textAlign: "center",
                          width: "inherit",
                          maxWidth: "inherit",
                          minWidth: "50px",
                        }}
                      >
                        {item.countable ? (
                          <BiCheckCircle color="#47cc47" />
                        ) : (
                          <BsEyeSlashFill color="#cc4747" />
                        )}
                      </td>
                      <td
                        style={{
                          width: "inherit",
                          maxWidth: "inherit",
                          minWidth: "100px",
                        }}
                      >
                        {item.address}
                      </td>
                      <td
                        style={{
                          width: "inherit",
                          maxWidth: "inherit",
                          minWidth: "100px",
                        }}
                      >
                        {item.goods}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {statusesRussian[item.status]}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {item.deliveryPay}
                        тг
                      </td>
                      <td style={{ textAlign: "center" }}>{item.sum} тг</td>
                      <td style={{ textAlign: "center" }}>
                        {item.paymentSum} тг
                      </td>
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
                  {deliveryList?.deliveries?.length -
                    (payoffDeliveriesSum?.cancelledSum
                      ? payoffDeliveriesSum.cancelledSum
                      : 0)}{" "}
                  шт.
                </td>
                <td
                  style={{
                    textAlign: "center",
                    width: "inherit",
                    maxWidth: "inherit",
                    minWidth: "50px",
                  }}
                >
                  {payoffDeliveriesSum?.countableSum
                    ? payoffDeliveriesSum.countableSum
                    : 0}{" "}
                  шт.
                </td>
                <td style={{ fontWeight: "bold" }} colSpan={3}>
                  Всего:{" "}
                  {isNaN(
                    payoffDeliveriesSum?.paymentSums -
                      payoffDeliveriesSum?.deliveryCosts
                  )
                    ? 0
                    : payoffDeliveriesSum?.paymentSums -
                      payoffDeliveriesSum?.deliveryCosts -
                      parseInt(deliveryList?.cash ? deliveryList.cash : 0)}{" "}
                  тг
                </td>
                <td style={{ textAlign: "center" }}>
                  {payoffDeliveriesSum?.deliveryCosts
                    ? payoffDeliveriesSum.deliveryCosts
                    : 0}{" "}
                  тг
                </td>
                <td style={{ textAlign: "center" }}>
                  {payoffDeliveriesSum?.orderSums
                    ? payoffDeliveriesSum.orderSums
                    : 0}{" "}
                  тг
                </td>
                <td style={{ textAlign: "center" }}>
                  {payoffDeliveriesSum?.paymentSums
                    ? payoffDeliveriesSum.paymentSums
                    : 0}{" "}
                  тг
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Modal>
    </div>
  );
}

export default DeliveryLists;
