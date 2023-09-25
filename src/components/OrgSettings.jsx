import Select from "./Select";
import { useMemo, useState, useEffect, useCallback } from "react";
import Button from "./Button";
import Modal from "./Modal";
import LegendInput from "./LegendInput";
import { BiCheckCircle, BiPencil, BiPlus, BiTrash } from "react-icons/bi";
import { getOrgInfo, editOrgInfo } from "../api/OrganizationService";
import { useNavigate } from "react-router-dom";
import cl from "../styles/Goods.module.css";
import useAuth from "../hooks/useAuth";

function OrgSettings() {
  const [paymentMethodsModal, setPaymentMethodsModal] = useState(false);
  const [addPaymentModal, setAddPaymentModal] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [invControlType, setInvControlType] = useState("fifo");
  const [methodName, setMethodName] = useState("");
  const [methodCode, setMethodCode] = useState("");
  const [methodValue, setMethodValue] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [data, setData] = useState({});
  const navigate = useNavigate();
  const { alert } = useAuth();

  const invControlTypes = useMemo(
    () => [
      { id: "fifo", name: "(FIFO) Первый пришел, Первый ушел" },
      { id: "lifo", name: "(LIFO) Последний пришел, Первый ушел" },
    ],
    []
  );

  const settingRow = useMemo(() => {
    return {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      margin: "10px 0",
    };
  }, []);

  const addMethod = useCallback(
    (name, code, value) => {
      if (name === "" || code === "" || value === "") {
        alert("Ошибка!", "Поля не могут быть пустыми");
        return;
      }
      setPaymentMethods((methods) => {
        const temp = methods;
        let biggestId = 0;
        for (let item of temp) {
          if (item.id > biggestId) {
            biggestId = item.id;
          } else if (item.id === biggestId) {
            biggestId++;
          }
        }
        temp.push({
          id: biggestId,
          name,
          code,
          value,
        });
        setAddPaymentModal(false);
        return temp;
      });
    },
    [alert]
  );

  const deleteMethod = useCallback((id) => {
    setPaymentMethods((methods) => {
      const temp = methods.filter((item) => {
        return id !== item.id;
      });
      return temp;
    });
  }, []);

  useEffect(() => {
    getOrgInfo({ setFetchLoading, setData });
  }, []);

  useEffect(() => {
    setMethodCode("");
    setMethodName("");
    setMethodValue("");
  }, [addPaymentModal]);

  useEffect(() => {
    setInvControlType(data.inventorycontroltype);
    if (!data.paymentMethods || Object.keys(data.paymentMethods).length === 0) {
      setPaymentMethods([]);
    } else {
      setPaymentMethods(data.paymentMethods);
    }
  }, [data]);

  return (
    <div
      style={{
        padding: "10px 0",
        margin: "20px 0",
        maxWidth: 600,
        color: "#3d3d3d",
      }}
    >
      <p style={{ fontSize: 16, fontWeight: "bold", marginBottom: 20 }}>
        Настройки организации
      </p>
      <div style={settingRow}>
        <p>Метод оценки запасов</p>
        <Select
          loading={fetchLoading || processLoading}
          style={{ margin: 0, maxWidth: 280 }}
          options={invControlTypes}
          value={invControlType}
          setValue={setInvControlType}
          type="settings"
        />
      </div>
      <div style={settingRow}>
        <div></div>
        <Button
          style={{ margin: 0 }}
          icon={<BiCheckCircle />}
          disabled={processLoading}
          text="Сохранить"
          onClick={() => {
            editOrgInfo({
              newData: { inventorycontroltype: invControlType },
              setProcessLoading,
              next: () => navigate(0),
            });
          }}
        />
      </div>
      <div style={{ ...settingRow, marginTop: 15 }}>
        <p>Методы оплаты</p>
        <p>
          {fetchLoading
            ? "Загрузка..."
            : paymentMethods.length + " методов оплаты"}
        </p>
      </div>
      <div style={settingRow}>
        <div></div>
        <Button
          style={{ margin: 0 }}
          icon={<BiPencil />}
          disabled={processLoading}
          text="Редактировать"
          onClick={() => {
            setPaymentMethodsModal(true);
          }}
        />
      </div>
      <Modal
        modalVisible={paymentMethodsModal}
        setModalVisible={setPaymentMethodsModal}
        noEscape={processLoading || addPaymentModal}
      >
        <p>Редактирование способов оплаты</p>
        <div
          className={cl.tableWrapper}
          style={{
            height: "inherit",
            maxHeight: 350,
            marginTop: 15,
            marginBottom: 15,
          }}
        >
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Наименование</th>
                <th>Артикул</th>
                <th>Значение</th>
                <th></th>
              </tr>
            </thead>
            {paymentMethods.length === 0 ? (
              <tbody style={{ width: "100%", textAlign: "center" }}>
                <tr>
                  <td colSpan={1000 - 7}>Не найдено</td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {paymentMethods.map((method, index) => {
                  return (
                    <tr key={method.id}>
                      <td>{index + 1}</td>
                      <td>{method.name}</td>
                      <td style={{ textAlign: "center" }}>{method.code}</td>
                      <td style={{ textAlign: "center" }}>{method.value} %</td>
                      <td>
                        <div className={cl.MoreButtonWrapper}>
                          <div
                            onClick={() => {
                              deleteMethod(method.id);
                            }}
                            className={cl.MoreButton}
                          >
                            <BiTrash color="red" />
                          </div>
                        </div>
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
            justifyContent: "center",
            width: "100%",
            marginTop: 10,
          }}
        >
          <Button
            disabled={fetchLoading || processLoading}
            text="Добавить"
            icon={<BiPlus />}
            onClick={() => {
              setAddPaymentModal(true);
            }}
          />
          <Button
            disabled={fetchLoading || processLoading}
            text="Сохранить"
            icon={<BiCheckCircle />}
            onClick={() => {
              editOrgInfo({
                newData: { paymentMethods: JSON.stringify(paymentMethods) },
                setProcessLoading,
                next: () => navigate(0),
              });
            }}
          />
        </div>
      </Modal>
      <Modal
        modalVisible={addPaymentModal}
        setModalVisible={setAddPaymentModal}
        noEscape={processLoading}
      >
        <p>Добавление способа оплаты</p>
        <LegendInput
          value={methodName}
          legend="Наименование"
          setValue={setMethodName}
        />
        <LegendInput
          value={methodCode}
          legend="Артикул"
          setValue={setMethodCode}
        />
        <LegendInput
          value={methodValue}
          legend="Значение"
          setValue={setMethodValue}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            marginTop: 10,
          }}
        >
          <Button
            disabled={fetchLoading || processLoading}
            text="Добавить"
            icon={<BiPlus />}
            onClick={() => {
              addMethod(methodName, methodCode, methodValue);
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

export default OrgSettings;
