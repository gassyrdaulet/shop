import { useState, useEffect, useMemo, useCallback } from "react";
import {
  BsArrowLeftCircle,
  BsCarFront,
  BsPencil,
  BsPrinterFill,
} from "react-icons/bs";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { useNavigate, useParams } from "react-router-dom";
import cl from "../styles/Goods.module.css";
import {
  getOrderDetails,
  sendDeliver,
  issueOrder,
  finishOrder,
  cancelOrder,
  recreateOrder,
  returnOrder,
  issuePickup,
  sendKaspiCode,
  editOrderManager,
  editOrderDeliver,
} from "../api/OrderService";
import Loading from "../components/Loading";
import moment from "moment/moment";
import InfoRow from "../components/InfoRow";
import Modal from "../components/Modal";
import LegendInput from "../components/LegendInput";
import Button from "../components/Button";
import Select from "../components/Select";
import {
  getDelivers,
  getManagers,
  getOrgInfo,
} from "../api/OrganizationService";
import NoPaymentRow from "../components/NoPaymentRow";
import NoPaymentHeaders from "../components/NoPaymentHeaders";
import {
  BiCheckCircle,
  BiDownload,
  BiPlusCircle,
  BiReceipt,
  BiUserCircle,
} from "react-icons/bi";
import SearchInput from "../components/SearchInput";
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import config from "../config/config.json";
import { KJUR, KEYUTIL, stob64, hextorstr } from "jsrsasign";
import * as qz from "qz-tray";

const { SERVER_URL } = config;

qz.security.setCertificatePromise(function (resolve, reject) {
  resolve(
    "-----BEGIN CERTIFICATE-----\n" +
      "MIIEATCCAumgAwIBAgIUfc/Wpc+He/iyc6BWK3/yLqTP44IwDQYJKoZIhvcNAQELBQAwgY4xCzAJBgNVBAYTAktaMQ8wDQYDVQQIDAZBcW1vbGExDzANBgNVBAcMBkFzdGFuYTETMBEGA1UECgwKSmFja01hcmtldDELMAkGA1UECwwCSUUxFDASBgNVBAMMCyouZG9tcGVyLmt6MSUwIwYJKoZIhvcNAQkBFhZnYXNzeXJkYXVsZXRAZ21haWwuY29tMCAXDTIzMTAxMDExNTgxOFoYDzIwNTUwNDA0MTE1ODE4WjCBjjELMAkGA1UEBhMCS1oxDzANBgNVBAgMBkFxbW9sYTEPMA0GA1UEBwwGQXN0YW5hMRMwEQYDVQQKDApKYWNrTWFya2V0MQswCQYDVQQLDAJJRTEUMBIGA1UEAwwLKi5kb21wZXIua3oxJTAjBgkqhkiG9w0BCQEWFmdhc3N5cmRhdWxldEBnbWFpbC5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC2lzI7gLDj4OKcgL8GT/GZ/H+TQZojuBGyqC9XbyYA5xecIAQuasTf6tt+Nmv0tyA3sO/vnnenRCOzB8afWZahf2DZQ1+7Kq04acAbySgRix+e6zbUFTlgQmCA/MyiYVOKtWjsRwq+fGZJcFaJ/8A5H6OeUlck/Z5XZJ2tF6t+5rdDlUJnnvM23nYqRNcRecQRB26cXkNXMjFMAjAgm+ZL7uyu0j8ehcWNCybCS/RorK5i/7gnJgB1uyaxXrl20pZ/C804AM+BQP7uehw9clinjkSr+qoZT58AqehwW56nbQBP3hqQOgrqZShN6eOuXFPxZqbQphHDwavmGi1JKopjAgMBAAGjUzBRMB0GA1UdDgQWBBQ3cLnWQbbB8DyTCaoSeztGOwrk/jAfBgNVHSMEGDAWgBQ3cLnWQbbB8DyTCaoSeztGOwrk/jAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQCOg/UBc1XkjOuUq7Sm6RbObIQeSHNEQvafYhNv99PhXPhdgdje09jzhI3Xgp0H7DUp+Qivll9sYN4fLJsEYgCrCdkDJ96anmHPJ1Cuxrq/GiWn/PLEmNPJgLc9djlX+4e7txxGW+/kPOrBbqap8pY9odtMoh5qpZ/l4zmPmlRejNy+Z9hghlXyPNJF9mNn/dSagtHsjozSXJ4cYgOAQnQavchxGNmCzPUnJRwOR+MMkJVw2RJQTBQY+tajCiEOD2voUHKZZaIQo685wM0tnHbjtzacPRHcE985PkJNeFVPUtvSVnh0mmVBp4gDLO2GgikXZ9FYuI7L+ZC2qqT+FefU\n" +
      "-----END CERTIFICATE-----"
  );
});

const privateKey =
  "-----BEGIN PRIVATE KEY-----\n" +
  "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC2lzI7gLDj4OKcgL8GT/GZ/H+TQZojuBGyqC9XbyYA5xecIAQuasTf6tt+Nmv0tyA3sO/vnnenRCOzB8afWZahf2DZQ1+7Kq04acAbySgRix+e6zbUFTlgQmCA/MyiYVOKtWjsRwq+fGZJcFaJ/8A5H6OeUlck/Z5XZJ2tF6t+5rdDlUJnnvM23nYqRNcRecQRB26cXkNXMjFMAjAgm+ZL7uyu0j8ehcWNCybCS/RorK5i/7gnJgB1uyaxXrl20pZ/C804AM+BQP7uehw9clinjkSr+qoZT58AqehwW56nbQBP3hqQOgrqZShN6eOuXFPxZqbQphHDwavmGi1JKopjAgMBAAECggEAGhFe+hDG8FnAcKCO5StPrnDWk+L3Sycx26RYUe7L6bAUdlU505ipr+A7YvsJEaB9aIYJ01d39LjtMden20Mylq71WD9esP2ISngKlczzvAF1S76ADupSzTPczD2LR5mGkFSS/Lytw4FGJzDzIfOR8XXbabSOvXi5/Pcf7cDl2pF+UzA4soIGUgB37wEpVyNDNtlHXK14btrWPoxFfLEHSpI7LR1JJkA6BgudOq4Q0PpsMGFu5OzmJYRokeE3jze6kHGTFjiw3ejXK2n0xXVFi0HdvI48tKyuC2bsht9pTKLbLBexHrsJO6vsA1HGsXoeQ4DETZEXTWWboXn+O09iqQKBgQD9GH0mkqdaG4vktBBRMfPFhMjIbjszNuNK9LQwnEc5KoN7BcGnxZqwdzaR9grqnCYiFKnIhxBajZswxNLZvbuVYbX9ofGyY5fxnjRp4/Q341w2fqFq39VeLgfXKVd350IGMZJcxjS+/UqkIYcQipElZpQhxU22ghZ3yoP8EcrayQKBgQC4r5Y+llwjtxCvfaUIwiKf3Px4vEC4CxinkK329DxFY89KOWgxXAbxEjqMAc3yHfjCtFG3CJ8iJ14UpGNzQOL4aMBFNxilgYjmrGDjWtiKjjqllFk55ECSKe2ZOXJv/mw8yLOmvWq1uWM/42TA2yEBb1Z1RoP1kiqREDOGJjAlywKBgARz5tfD4r/aFjb62AKlr1U9Rc8I6W+4On16GqV0Smh+D/wdGNAb0OHj5wjgXEbOYnldBbOqdKYzMZTFEbSU+vTg2DPTIo5x5B1zHBb01Loa/OdUiQB5Waajhq3JY2mPnwC+5IVPU2Q8zpBeqqKm3XDcAiUp9HkOhtiqrnHD2l7JAoGBAIDXPeF709u2opVK+g8aID2WVSuFaUD7vL9pV3Oo/0MJVltZoS6OHOmg5ec2ew4lip2KXldqVFnnTOLpq9eDtNPHgBrJTRBpRbBnIVB62AYRIyjQTU7txX4ycecrBILM44WkHnB8RC1yn6K6aFeCh4wQuCgogXaX+copm0hC6+PxAoGBAL6GHFOEhA1eSECcQS35Bd7d8h3tduHb+h849wt5T2VZJ1QTPaiSRzqL11BN0ZEZ2k0SPp6jmYhA/5aH2JFuaQupnuK8Oc/vbbnmvM1ZwNN2edo+KceO20M7+diopaOBtSDY9o0D8n9+NdYsq8ThtIC7O4ZSDPXvlgVKe3QDthpY\n" +
  "-----END PRIVATE KEY-----";

qz.security.setSignatureAlgorithm("SHA512");

qz.security.setSignaturePromise(function (hash) {
  return function (resolve, reject) {
    try {
      const pk = KEYUTIL.getKey(privateKey);
      const sig = new KJUR.crypto.Signature({ alg: "SHA512withRSA" }); // Use "SHA1withRSA" for QZ Tray 2.0 and older
      sig.init(pk);
      sig.updateString(hash);
      const hex = sig.sign();
      // console.log("DEBUG: \n\n" + stob64(hextorstr(hex)));
      resolve(stob64(hextorstr(hex)));
    } catch (err) {
      console.error(err);
      reject(err);
    }
  };
});

function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState({});
  const [fetchLoading, setFetchLoading] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);
  const [pickDeliverModal, setPickDeliverModal] = useState(false);
  const [addPaymentModal, setAddPaymentModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmPickupModal, setConfirmPickupModal] = useState(false);
  const [cause, setCause] = useState("");
  const [code, setCode] = useState("");
  const [cancelModal, setCancelModal] = useState(false);
  const [codeModal, setCodeModal] = useState(false);
  const [recreateModal, setRecreateModal] = useState(false);
  const [returnModal, setReturnModal] = useState(false);
  const [editManagerModal, setEditManagerModal] = useState(false);
  const [newManager, setNewManager] = useState(0);
  const [newDeliver, setNewDeliver] = useState(-1);
  const [managersLoading, setManagersLoading] = useState(true);
  const [deliver, setDeliver] = useState(-1);
  const [delivers, setDelivers] = useState([]);
  const [fetchedPaymentMethods, setFetchedPaymentMethods] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState([]);
  const [managers, setManagers] = useState([]);
  const [deliversLoading, setDeliversLoading] = useState(false);
  const [payment, setPayment] = useState([]);
  const [isTherePrinters, setIsTherePrinters] = useState(false);
  const [printCheckModal, setPrintCheckModal] = useState(false);
  const [editDeliverModal, setEditDeliverModal] = useState(false);
  const [cashFromDeliver, setCashFromDeliver] = useState("0");

  const blobToBase64 = async (blob) => {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result1 = reader.result;
        const result2 = result1.substr(result1.indexOf(",") + 1);
        resolve(result2);
      };
      reader.readAsDataURL(blob);
    });
  };

  const newPayment = (paymentItem) => {
    const temp = [...payment];
    let biggestId = 0;
    temp.forEach((item) => {
      if (item.id > biggestId) {
        biggestId = item.id;
      }
    });
    temp.push({ id: biggestId + 1, ...paymentItem });
    setPayment(temp);
  };

  useEffect(() => {
    qz.websocket
      .connect()
      .then(() => qz.printers.find())
      .then((printers) => {
        if (printers?.length === 0) {
          setIsTherePrinters(false);
        } else {
          setIsTherePrinters(true);
        }
      })
      .catch((e) => {
        setIsTherePrinters(false);
        console.log("QZ connect Error:", e?.message);
      });
    return () => {
      qz.websocket.disconnect().catch((e) => {
        console.log("QZ disconnect Error:", e?.message);
      });
    };
  }, []);

  useEffect(() => {
    setCause("");
  }, [cancelModal, recreateModal]);

  useEffect(() => {
    getOrderDetails({ id, setData, setFetchLoading });
  }, [id]);

  useEffect(() => {
    if (data.deliverystatus === "new" || data.deliverystatus === "delivering") {
      getDelivers({ setDelivers, setDeliversLoading });
    }
  }, [data]);

  useEffect(() => {
    getOrgInfo({
      setData: () => {},
      setFetchLoading: setPaymentsLoading,
      setValue: (key, v) => {
        if (key === "paymentMethods") {
          setFetchedPaymentMethods(v);
        }
      },
    });
    getManagers({ setManagers, setManagersLoading });
  }, []);

  const managersWithStore = useMemo(() => {
    const temp = [...managers];
    temp.push({ id: -1, name: "Магазин" });
    return temp;
  }, [managers]);

  const orderStatuses = useMemo(() => {
    return {
      awaiting: "Ожидает выдачи",
      processing: "На обработке",
      cancelled: "Отменен",
      returned: "Возвращен",
      finished: "Завершен",
    };
  }, []);

  const deliveryStatuses = useMemo(() => {
    return {
      new: "Новый",
      awaits: "Ожидает согласия курьера",
      delivering: "На доставке",
      processing: "На обработке",
      cancelled: "Отменен",
      finished: "Завершен",
    };
  }, []);

  const actions = useMemo(() => {
    return {
      created: "СОЗДАН",
      sent: "ПРИНЯТ НА ДОСТАВКУ",
      issued: "ВЫДАН",
      cancelled: "ОТМЕНЕН",
      returned: "ОФОРМЛЕН ВОЗВРАТ",
      finished: "ЗАВЕРШЕН",
      recreated: "ПЕРЕСОЗДАН",
      refusal: "ОТКАЗ ОТ ДОСТАВКИ",
      edited: "ОТРЕДАКТИРОВАН",
    };
  }, []);

  const paymentMethods = useMemo(() => {
    const temp = {};
    for (let method of fetchedPaymentMethods) {
      temp[method.code] = method.name;
    }
    return temp;
  }, [fetchedPaymentMethods]);

  const roles = useMemo(() => {
    return {
      deliver: "Курьеру",
      manager: "Менеджеру",
      cashier: "Кассиру",
    };
  }, []);

  const plannedDeliveryDate = useMemo(() => {
    try {
      const plan = data.deliveryinfo.plannedDeliveryDate;
      if (
        data.deliverystatus === "processing" ||
        data.deliverystatus === "finished" ||
        data.deliverystatus === "cancelled" ||
        data.deliverystatus === "returned"
      ) {
        return {
          present: true,
          color: "black",
          value:
            "Запланированная дата доставки: " +
            moment(plan).format("DD.MM.yyyy"),
        };
      }
      if (data.deliverystatus === "pickup") {
        return { present: false };
      }
      const difference =
        moment().startOf("day").valueOf() -
        moment(plan).startOf("day").valueOf();
      if (difference < 0) {
        return {
          present: true,
          color: "black",
          value: moment(plan).format("DD.MM.yyyy"),
        };
      }
      if (difference >= 24 * 60 * 60 * 1000) {
        return {
          present: true,
          color: "red",
          value:
            "Вы опоздали. Запланированная дата была: " +
            moment(plan).format("DD.MM.yyyy") +
            ". Доставьте сегодня.",
        };
      }
      return {
        present: true,
        color: "green",
        value: "Доставьте сегодня. (" + moment(plan).format("DD.MM.yyyy") + ")",
      };
    } catch {
      return {
        present: false,
      };
    }
  }, [data]);

  const goodList = useMemo(() => {
    try {
      return data.goods.map((good) => {
        const damount = good?.discount?.amount;
        const dtype = good?.discount?.type;
        return (
          good.quantity +
          "шт. [" +
          good.name +
          `]` +
          ` по ${good.price}тг` +
          (damount
            ? damount === 0
              ? ""
              : ` (${damount > 0 ? `Скидка` : `Наценка`} - ${Math.abs(
                  damount
                )}${dtype === "percent" ? "%" : dtype} за шт.)`
            : "")
        );
      });
    } catch {
      return [];
    }
  }, [data]);

  const historyList = useMemo(() => {
    try {
      const result = data.history.map((item, index) => {
        return (
          index +
          1 +
          ") " +
          moment(item.date).format("DD.MM.yyyy HH:mm - ") +
          `[${actions[item.action]}] - ` +
          item.user +
          (item.cause ? ` - [Причина отмены: ${item.cause}]` : "")
        );
      });
      return result;
    } catch {
      return [];
    }
  }, [data, actions]);

  const paymentSum = useMemo(() => {
    try {
      const { payment } = data;
      let tempSum = 0;
      payment.forEach((item) => {
        tempSum += item.sum;
      });
      return tempSum;
    } catch {
      return 0;
    }
  }, [data]);

  const paymentList = useMemo(() => {
    try {
      const result = data.payment.map((item, index) => {
        const method = paymentMethods[item.method];
        const user = item.user ? roles[item.user] : "";
        return (
          index +
          1 +
          `. ${item.sum} тг [${method ? method : item.method}] ${user}`
        );
      });
      if (result.length === 0) {
        return ["0 тг"];
      }
      return [...result, "Общая оплаченная сумма: " + paymentSum + " тг"];
    } catch {
      return [];
    }
  }, [data, paymentMethods, roles, paymentSum]);

  const sum = useMemo(() => {
    try {
      const { goods, deliveryinfo: delivery } = data;
      let tempSum = 0;
      goods.forEach(
        (good) =>
          (tempSum +=
            good.quantity * good.price -
            (good.discount.type === "percent"
              ? ((good.price * good.discount.amount) / 100) * good.quantity
              : good.discount.amount * good.quantity))
      );
      const deliveryPrice = parseInt(delivery["deliveryPriceForCustomer"]);
      tempSum += isNaN(deliveryPrice) ? 0 : deliveryPrice;
      return tempSum;
    } catch {
      return 0;
    }
  }, [data]);

  const sumWithDiscount = useMemo(() => {
    try {
      const { discount } = data;
      let tempSum =
        sum -
        (discount.type === "percent"
          ? (sum * discount.amount) / 100
          : discount.amount);
      return tempSum;
    } catch {
      return 0;
    }
  }, [sum, data]);

  const discount = useMemo(() => {
    try {
      const { discount } = data;
      let tempSum =
        discount.type === "percent"
          ? (sum * discount.amount) / 100
          : discount.amount;
      return tempSum === 0
        ? "0 тг"
        : tempSum +
            `тг ( - ${discount.amount}${
              discount.type === "percent" ? "%" : "тг"
            })`;
    } catch {
      return 0;
    }
  }, [sum, data]);

  const isKaspi = useMemo(() => {
    try {
      if (data?.kaspiinfo) {
        if (Object.keys(data.kaspiinfo).length !== 0) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }, [data]);

  const paymentSumLocal = useMemo(() => {
    try {
      let tempSum = 0;
      payment.forEach((item) => {
        tempSum += item.sum;
      });
      return tempSum;
    } catch {
      return 0;
    }
  }, [payment]);

  const difference = useMemo(() => {
    try {
      let tempSum = paymentSum + paymentSumLocal - sumWithDiscount;
      return tempSum;
    } catch {
      return 0;
    }
  }, [sumWithDiscount, paymentSum, paymentSumLocal]);

  const buttons = [
    {
      disabled: processLoading,
      icon: <BsArrowLeftCircle />,
      text: "Назад",
      onClick: () => navigate(-1),
    },
  ];
  const buttons2 = [
    {
      show:
        data.status === "awaiting" &&
        (data.deliverystatus === "delivering" ||
          data.deliverystatus === "waiting"),
      disabled: processLoading,
      icon: <BsCarFront />,
      text: "Поменять курьера",
      onClick: () => {
        setEditDeliverModal(true);
      },
    },
    {
      show: !processLoading,
      disabled: processLoading,
      icon: <BiReceipt />,
      text: "Чек продажи",
      onClick: () => {
        setPrintCheckModal(true);
      },
    },
    {
      show: data.status === "awaiting",
      disabled: processLoading,
      icon: <BsPencil />,
      text: "Редактировать",
      onClick: () => {
        navigate("/orders/edit/" + id);
      },
    },
    {
      show: true,
      disabled: processLoading,
      icon: <BiUserCircle />,
      text: "Поменять продавца",
      onClick: () => {
        setEditManagerModal(true);
      },
    },
  ];
  const buttons3 = [
    {
      disabled: processLoading || deliversLoading,
      icon: <AiOutlineCheckCircle />,
      text: "Отправить",
      onClick: () => {
        sendDeliver({
          deliver,
          setProcessLoading,
          next: () => {
            setPickDeliverModal(false);
            navigate("/delivery/new");
          },
          orderIds: [id],
        });
      },
    },
  ];
  const buttons4 = [
    {
      disabled: processLoading || paymentsLoading,
      icon: <BiPlusCircle />,
      text: "Добавить оплату",
      onClick: () => {
        newPayment({
          sum: difference > 0 ? 0 : -difference,
          method: "cash",
        });
      },
    },
    {
      disabled: processLoading || difference !== 0,
      icon: <AiOutlineCheckCircle />,
      text: "Сохранить и подтвердить",
      onClick: () => {
        issueOrder({
          payment,
          id,
          setProcessLoading,
          next: () => {
            navigate("/delivery/delivering");
          },
        });
      },
    },
  ];
  const buttons9 = [
    {
      disabled: processLoading || paymentsLoading,
      icon: <BiPlusCircle />,
      text: "Добавить оплату",
      onClick: () => {
        newPayment({
          sum: difference > 0 ? 0 : -difference,
          method: "cash",
        });
      },
    },
    {
      disabled: processLoading || difference !== 0,
      icon: <AiOutlineCheckCircle />,
      text: "Сохранить и подтвердить",
      onClick: () => {
        issuePickup({
          payment,
          id,
          setProcessLoading,
          next: () => {
            navigate(-1);
          },
        });
      },
    },
  ];
  const buttons10 = [
    {
      disabled: !isTherePrinters || processLoading,
      icon: <BsPrinterFill />,
      text: "Распечатать чек",
      onClick: () => {
        const { discount } = data;
        let discountSum = 0;
        data.goods.forEach((good) => {
          discountSum +=
            good.discount.type === "percent"
              ? ((good.price * good.discount.amount) / 100) * good.quantity
              : good.discount.amount * good.quantity;
        });
        discountSum +=
          discount.type === "percent"
            ? (sum * discount.amount) / 100
            : discount.amount;
        createPDFReceipt(
          id,
          data.creationdate,
          data?.cashierId ? data.cashierId : 1,
          0,
          discountSum,
          sumWithDiscount,
          true
        );
      },
    },
    {
      disabled: processLoading,
      icon: <BiDownload />,
      text: "Скачать чек",
      onClick: () => {
        const { discount } = data;
        let discountSum = 0;
        data.goods.forEach((good) => {
          discountSum +=
            good.discount.type === "percent"
              ? ((good.price * good.discount.amount) / 100) * good.quantity
              : good.discount.amount * good.quantity;
        });
        discountSum +=
          discount.type === "percent"
            ? (sum * discount.amount) / 100
            : discount.amount;
        createPDFReceipt(
          id,
          data.creationdate,
          data?.cashierId ? data.cashierId : 1,
          0,
          discountSum,
          sumWithDiscount,
          false
        );
      },
    },
  ];
  const buttons5 = [
    {
      disabled: processLoading,
      icon: <BiPlusCircle />,
      text: "Нет",
      onClick: () => {
        setConfirmModal(false);
      },
    },
    {
      disabled: processLoading,
      icon: <AiOutlineCheckCircle />,
      text: "Да",
      onClick: () => {
        const { payment } = data;
        let paymentSum = 0;
        payment.forEach((item) => {
          if (item?.user === "deliver") {
            paymentSum += item.sum;
          }
        });
        finishOrder({
          deliver: data.deliverId,
          deliveryList: [
            {
              id: data.id,
              address: data.deliveryinfo.address,
              sum: sumWithDiscount,
              deliveryPay: data.deliveryinfo.deliveryPriceForDeliver,
              status: data.status,
              paymentSum,
            },
          ],
          comment: "",
          cash: cashFromDeliver,
          ids: [id],
          setProcessLoading,
          next: () => {
            navigate("/delivery/processing");
          },
        });
      },
    },
  ];
  const buttons6 = [
    {
      disabled: processLoading,
      icon: <BiPlusCircle />,
      text: "Нет",
      onClick: () => {
        setCancelModal(false);
      },
    },
    {
      disabled: processLoading,
      icon: <AiOutlineCheckCircle />,
      text: "Да",
      onClick: () => {
        cancelOrder({
          id,
          cause,
          setProcessLoading,
          next: () => {
            navigate(data.delivery === 1 ? "/delivery/new" : "/pickup/new");
          },
        });
      },
    },
  ];

  const buttons7 = [
    {
      disabled: processLoading,
      icon: <BsArrowLeftCircle />,
      text: "Нет",
      onClick: () => {
        setRecreateModal(false);
      },
    },
    {
      disabled: processLoading,
      icon: <AiOutlineCheckCircle />,
      text: "Да",
      onClick: () => {
        recreateOrder({
          id,
          cause,
          setProcessLoading,
          next: () => {
            navigate("/delivery/new");
          },
        });
      },
    },
  ];
  const buttons8 = [
    {
      disabled: processLoading,
      icon: <BsArrowLeftCircle />,
      text: "Нет",
      onClick: () => {
        setReturnModal(false);
      },
    },
    {
      disabled: processLoading,
      icon: <AiOutlineCheckCircle />,
      text: "Да",
      onClick: () => {
        returnOrder({
          id,
          cause,
          setProcessLoading,
          next: () => {
            navigate(-1);
          },
        });
      },
    },
  ];

  const OrderButtons = useMemo(() => {
    try {
      return [
        {
          id: 6,
          show: data.status === "awaiting" && data.deliverystatus === "pickup",
          buttons: [
            {
              disabled: processLoading,
              text: "Подтвердить",
              name: "confirm",
              fill: "fill",
              onClick: () => {
                setConfirmPickupModal(true);
              },
            },
          ],
        },
        {
          id: -1,
          show:
            data.status === "awaiting" && data.deliverystatus === "delivering",
          buttons: [
            {
              disabled: processLoading,
              text: "Завершить",
              name: "finish",
              fill: "fill",
              onClick: () => {
                setAddPaymentModal(true);
              },
            },
          ],
        },
        {
          id: 0,
          show: data.status === "awaiting" && data.deliverystatus === "new",
          buttons: [
            {
              disabled: processLoading || deliversLoading,
              text: "Отправить",
              name: "senddeliver",
              fill: "fill",
              onClick: () => {
                setPickDeliverModal(true);
              },
            },
          ],
        },
        {
          id: 1,
          show:
            (data.status === "processing" || data.status === "cancelled") &&
            data.deliverystatus === "processing",
          buttons: [
            {
              disabled: processLoading,
              text: "Подтвердить",
              name: "confirm",
              fill: "fill",
              onClick: () => {
                setConfirmModal(true);
              },
            },
          ],
        },
        {
          id: 2,
          show: data.status === "awaiting" && isKaspi,
          buttons: [
            {
              disabled: processLoading,
              text: "Выслать код",
              name: "sendcode",
              fill: "fill",
              onClick: () => {
                sendKaspiCode({
                  order_id: data.kaspiinfo.order_id,
                  setProcessLoading,
                  managerId: data.authorId,
                  code: "",
                  confirm: false,
                });
              },
            },
            {
              disabled: processLoading,
              text: "Подтвердить код",
              name: "checkcode",
              fill: "outline",
              onClick: () => {
                setCodeModal(true);
              },
            },
          ],
        },
        {
          id: 3,
          show:
            (data.status === "awaiting" || data.status === "processing") &&
            (data.deliverystatus === "processing" ||
              data.deliverystatus === "new" ||
              data.deliverystatus === "delivering" ||
              data.deliverystatus === "pickup"),
          buttons: [
            {
              disabled: processLoading,
              text: "Отменить",
              name: "cancel",
              fill: "outline",
              onClick: () => {
                setCancelModal(true);
              },
            },
          ],
        },
        {
          id: 4,
          show:
            (data.status === "awaiting" || data.status === "processing") &&
            (data.deliverystatus === "processing" ||
              data.deliverystatus === "delivering"),
          buttons: [
            {
              disabled: processLoading,
              text: "Отказаться от доставки",
              name: "recreate",
              fill: "outline",
              onClick: () => {
                setRecreateModal(true);
              },
            },
          ],
        },
        {
          id: 5,
          show:
            data.status === "finished" &&
            (data.deliverystatus === "finished" ||
              data.deliverystatus === "pickup"),
          buttons: [
            {
              disabled: processLoading,
              text: "Оформить возврат",
              name: "return",
              fill: "outline",
              onClick: () => {
                setReturnModal(true);
              },
            },
          ],
        },
      ];
    } catch {
      return [];
    }
  }, [data, processLoading, isKaspi, deliversLoading]);

  const createPDFReceipt = async (
    receiptId,
    receiptDate,
    cashier,
    change,
    totalDiscountSum,
    totalSum,
    print
  ) => {
    try {
      const storeName = "JACK MARKET";
      const storeDesc = "Товары для дома";
      const storeAddress = "Косшыгулулы 20 | +7 (702) 196 38 00";
      const date = moment(receiptDate).format("DD.MM.yyyy HH:mm");

      const boldFontBytes = await fetch(
        SERVER_URL + "/fonts/oswaldmedium.ttf"
      ).then((res) => res.arrayBuffer());
      const reguFontBytes = await fetch(SERVER_URL + "/fonts/oswald.ttf").then(
        (res) => res.arrayBuffer()
      );
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      const boldFont = await pdfDoc.embedFont(boldFontBytes);
      const reguFont = await pdfDoc.embedFont(reguFontBytes);
      const marginTop = 20;
      const marginLeft = 15;
      const marginRight = 15;
      const fontSize = 20;
      const textHeight = reguFont.heightAtSize(fontSize);
      const boldHeight = boldFont.heightAtSize(fontSize);
      const pageWidth = 300;
      let goodsListHeight = 0;
      data.goods.forEach(() => {
        goodsListHeight += 40;
      });
      const pageHeight =
        marginTop +
        textHeight +
        16 +
        5 * (15 + textHeight) -
        15 +
        41 +
        20 +
        goodsListHeight +
        45 +
        15 +
        boldHeight +
        2 * (15 + textHeight) -
        textHeight;
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      const drawTextAtCenter = (text, yOffset, fontType = reguFont) => {
        const textWidth = fontType.widthOfTextAtSize(text, fontSize);
        const textHeight = fontType.heightAtSize(fontSize);
        page.drawText(text, {
          font: fontType,
          x: page.getWidth() / 2 - textWidth / 2,
          y: page.getHeight() - yOffset - textHeight - marginTop,
          size: fontSize,
        });
      };
      const drawTextAtStart = (text, yOffset, fontType = reguFont) => {
        const textHeight = fontType.heightAtSize(fontSize);
        page.drawText(text, {
          font: fontType,
          x: marginLeft,
          y: page.getHeight() - yOffset - textHeight - marginTop,
          size: fontSize,
        });
      };
      const drawTextAtEnd = (text, yOffset, fontType = reguFont) => {
        const textWidth = fontType.widthOfTextAtSize(text, fontSize);
        const textHeight = fontType.heightAtSize(fontSize);
        page.drawText(text, {
          font: fontType,
          x: page.getWidth() - marginRight - textWidth,
          y: page.getHeight() - yOffset - textHeight - marginTop,
          size: fontSize,
        });
      };
      const drawLine = (yOffset) => {
        const lineThickness = 2;
        const finalYOffset =
          page.getHeight() - yOffset - marginTop - lineThickness;
        page.drawLine({
          start: { x: 10, y: finalYOffset },
          end: { x: page.getWidth() - 10, y: finalYOffset },
          thickness: lineThickness,
        });
      };
      drawTextAtCenter(storeName, 0);
      drawLine(40);
      drawTextAtStart(storeDesc, 60);
      drawTextAtStart(storeAddress, 80);
      drawTextAtStart("Чек: #" + receiptId, 100);
      drawTextAtStart("Дата: " + date, 120);
      drawTextAtStart("Кассир: " + cashier, 140);
      drawTextAtCenter("ЧЕК ПРОДАЖИ", 170);
      drawLine(200);
      let marginBetweenGoods = 0;
      for (let good of data.goods) {
        drawTextAtStart(good.name, 210 + marginBetweenGoods);
        drawTextAtEnd(
          `${good.quantity} шт X ${good.price.toFixed(2)} = ${(
            good.quantity * good.price
          ).toFixed(2)} тг`,
          230 + marginBetweenGoods
        );
        marginBetweenGoods += 40;
      }
      drawTextAtEnd(
        `Скидка: ${totalDiscountSum} тг`,
        260 + marginBetweenGoods,
        reguFont
      );
      drawTextAtEnd(
        `ИТОГО: ${totalSum} тг`,
        280 + marginBetweenGoods,
        boldFont
      );
      // drawTextAtEnd(`Сдача: ${change} тг`, 205 + marginBetweenGoods);
      drawLine(320 + marginBetweenGoods);
      drawTextAtCenter(
        "*НАШ ИНТСТАГРАМ @JACK_MARKET_KZ*",
        330 + marginBetweenGoods
      );
      drawTextAtCenter("*Спасибо за покупку!*", 350 + marginBetweenGoods);
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const base64PDF = await blobToBase64(blob);
      if (print) {
        try {
          const config = qz.configs.create("XP-58", {
            encoding: "PC866",
            rasterize: false,
            orientation: "portrait",
          });
          await qz.print(config, [
            {
              type: "pixel",
              format: "pdf",
              flavor: "base64",
              data: base64PDF,
            },
          ]);
        } catch (err) {
          console.error("Print Error: ", err?.message);
        }
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "receipt.pdf";
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.log("CreatePDFLabels Error:", e);
    }
  };

  const handleCashChange = useCallback((value) => {
    const finalResult = isNaN(parseInt(value)) ? 0 : parseInt(value);
    setCashFromDeliver(finalResult);
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
            if (button.show) {
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
            }
            return "";
          })}
        </div>
      </div>
      <div className={cl.goodsWrapper}>
        <div className={cl.groupsWrapper} style={{ padding: "5px" }}></div>
        <div className={cl.secondHalf} style={{ paddingBottom: 50 }}>
          <div className={cl.inputsMobile}></div>
          <p style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
            Заказ №{id}
          </p>
          {fetchLoading ? (
            <div className={cl.Center}>
              <Loading which="gray" />
            </div>
          ) : (
            <div className={cl.OrderDetails}>
              {plannedDeliveryDate.present ? (
                <p
                  style={{ color: plannedDeliveryDate.color, marginBottom: 20 }}
                >
                  {plannedDeliveryDate.value}
                </p>
              ) : (
                ""
              )}
              <p className={cl.bigCaption}>Информация о заказе</p>
              <InfoRow caption="Статус" value={orderStatuses[data.status]} />
              <InfoRow caption="Состав заказа" value={goodList} />
              <InfoRow
                caption="Сумма заказа с доставкой и со скидкой"
                value={sumWithDiscount + " тг"}
              />
              <InfoRow caption="Оплачено" value={paymentList} />
              <InfoRow caption="Менеджер" value={data.author} />
              <p style={{ margin: "20px 0 15px 0" }} className={cl.bigCaption}>
                Информация о доставке
              </p>
              {data.delivery === 1 ? (
                <div>
                  <InfoRow caption="Доставка" value="Да" />
                  <InfoRow
                    caption="Статус доставки"
                    value={deliveryStatuses[data.deliverystatus]}
                  />
                  <InfoRow caption="Курьер" value={data.deliver} />
                  <InfoRow caption="Адрес" value={data.deliveryinfo.address} />
                  <InfoRow
                    caption="Номер телефона"
                    value={data.deliveryinfo.cellphone}
                  />
                  <InfoRow
                    caption="Стоимость доставки для клиента"
                    value={data.deliveryinfo.deliveryPriceForCustomer + " тг"}
                  />
                  <InfoRow
                    caption="Зарплата курьера"
                    value={data.deliveryinfo.deliveryPriceForDeliver + " тг"}
                  />
                </div>
              ) : (
                <InfoRow caption="Доставка" value="Самовывоз" />
              )}
              <p style={{ margin: "20px 0 15px 0" }} className={cl.bigCaption}>
                Детали заказа
              </p>
              <InfoRow
                caption="Вход в отчет"
                value={
                  data.countable === 1 ? "Входит в отчет" : "Не входит в отчет"
                }
              />
              <InfoRow caption="Сумма заказа без скидки" value={sum + " тг"} />
              <InfoRow caption="Скидка" value={discount} />
              <InfoRow caption="Кассир" value={data.cashier} />
              <InfoRow
                caption="Комментарий"
                value={data.comment === "" ? " - " : data.comment}
              />
              <InfoRow
                caption="Заказ из Магазина Kaspi.kz"
                value={isKaspi ? data.kaspiinfo.order_code : "Нет"}
              />
              <InfoRow caption="История заказа" value={historyList} />
              <div className={cl.OrderButtons}>
                {OrderButtons.map((item) => {
                  return item.show ? (
                    <div className={cl.OrderButtonsRow} key={item.id}>
                      {item.buttons.map((item2, index) => {
                        return (
                          <button
                            disabled={item2.disabled}
                            onClick={item2.onClick}
                            className={
                              cl.OrderButtonsButton +
                              " " +
                              (item2.fill === "fill"
                                ? cl.OrderButtonsButtonFill
                                : cl.OrderButtonsButtonOutline) +
                              " " +
                              (index + 1 === item.length
                                ? cl.OrderButtonsLastButton
                                : "")
                            }
                            key={item2.name}
                          >
                            {item2.text}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    ""
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal
        noEscape={processLoading}
        modalVisible={pickDeliverModal}
        setModalVisible={setPickDeliverModal}
      >
        <p>Выберите курьера</p>
        <Select
          value={deliver}
          options={delivers}
          loading={deliversLoading || processLoading}
          setValue={setDeliver}
          type={"managers"}
          style={{ margin: "10px 0" }}
        />
        <div className={cl.Center}>
          {buttons3.map((button) => {
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
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={confirmModal}
        setModalVisible={setConfirmModal}
      >
        <p>Подтвердите действие:</p>
        <p>Вы действительно хотите завершить этот заказ?</p>
        <LegendInput
          value={cashFromDeliver}
          setValue={handleCashChange}
          legend="Наличные от курьера"
          disabled={processLoading}
        />
        <div
          className={cl.Center}
          style={{ justifyContent: "space-around", marginTop: 20 }}
        >
          {buttons5.map((button) => {
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
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={cancelModal}
        setModalVisible={setCancelModal}
      >
        <p>Подтвердите действие:</p>
        <p>Вы действительно хотите отменить этот заказ?</p>
        <p>Пожалуйста, введите причину ниже.</p>
        <SearchInput
          value={cause}
          setValue={setCause}
          placeholder="Причина отмены"
          type="text"
        />
        <div
          className={cl.Center}
          style={{ justifyContent: "space-around", marginTop: 20 }}
        >
          {buttons6.map((button) => {
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
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={recreateModal}
        setModalVisible={setRecreateModal}
      >
        <p>Подтвердите действие:</p>
        <p>Вы действительно хотите отказаться от этого заказа?</p>
        <p>Пожалуйста, введите причину ниже.</p>
        <SearchInput
          value={cause}
          setValue={setCause}
          placeholder="Причина отмены"
          type="text"
        />
        <div
          className={cl.Center}
          style={{ justifyContent: "space-around", marginTop: 20 }}
        >
          {buttons7.map((button) => {
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
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={returnModal}
        setModalVisible={setReturnModal}
      >
        <p>Подтвердите действие:</p>
        <p>Вы действительно хотите оформить возврат этого заказа?</p>
        <p>Пожалуйста, введите причину ниже.</p>
        <SearchInput
          value={cause}
          setValue={setCause}
          placeholder="Причина отмены"
          type="text"
        />
        <div
          className={cl.Center}
          style={{ justifyContent: "space-around", marginTop: 20 }}
        >
          {buttons8.map((button) => {
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
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={printCheckModal}
        setModalVisible={setPrintCheckModal}
      >
        <p>Подтвердите действие:</p>
        <p>Вы хотите распечатать чек или скачать его?</p>
        <div
          className={cl.Center}
          style={{ justifyContent: "space-around", marginTop: 20 }}
        >
          {buttons10.map((button) => {
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
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={addPaymentModal}
        setModalVisible={setAddPaymentModal}
      >
        <p>Добавьте оплату</p>
        <p>Общая сумма: {sumWithDiscount}тг</p>
        <p>Уже оплачено: {paymentSum}тг</p>
        <p>Осталось к оплате: {-difference}тг</p>
        <div
          className={cl.tableWrapper}
          style={{
            height: "inherit",
            margin: "20px 0",
            minWidth: 320,
            maxHeight: 300,
            overflow: "auto",
          }}
        >
          <table>
            <thead>
              <NoPaymentHeaders />
            </thead>
            {payment.length === 0 ? (
              <tbody
                style={{
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <tr>
                  <td colSpan={10}>Нет оплаты</td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {payment.map((item, index) => {
                  return (
                    <NoPaymentRow
                      paymentMethods={fetchedPaymentMethods}
                      key={item.id}
                      setPayment={setPayment}
                      payment={payment}
                      editable={!processLoading || item.editable}
                      index={index + 1}
                      paymentItem={item}
                    />
                  );
                })}
              </tbody>
            )}
          </table>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {buttons4.map((button) => {
            return (
              <button
                disabled={button.disabled}
                key={button.text}
                onClick={button.onClick}
                className={cl.OptionsButton}
                style={{ marginBottom: 5 }}
              >
                {button.icon}
                {button.text}
              </button>
            );
          })}
        </div>
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={confirmPickupModal}
        setModalVisible={setConfirmPickupModal}
      >
        <p>Добавьте оплату</p>
        <p>Общая сумма: {sumWithDiscount}тг</p>
        <p>Уже оплачено: {paymentSum}тг</p>
        <p>Осталось к оплате: {-difference}тг</p>
        <div
          className={cl.tableWrapper}
          style={{
            height: "inherit",
            margin: "20px 0",
            minWidth: 320,
          }}
        >
          <table>
            <thead>
              <NoPaymentHeaders />
            </thead>
            {payment.length === 0 ? (
              <tbody
                style={{
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <tr>
                  <td colSpan={10}>Нет оплаты</td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {payment.map((item, index) => {
                  return (
                    <NoPaymentRow
                      paymentMethods={fetchedPaymentMethods}
                      key={item.id}
                      setPayment={setPayment}
                      payment={payment}
                      editable={!processLoading || item.editable}
                      index={index + 1}
                      paymentItem={item}
                    />
                  );
                })}
              </tbody>
            )}
          </table>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {buttons9.map((button) => {
            return (
              <button
                disabled={button.disabled}
                key={button.text}
                onClick={button.onClick}
                className={cl.OptionsButton}
                style={{ marginBottom: 5 }}
              >
                {button.icon}
                {button.text}
              </button>
            );
          })}
        </div>
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={codeModal}
        setModalVisible={setCodeModal}
      >
        <p>Подтверждение кода:</p>
        <LegendInput
          value={code}
          setValue={setCode}
          legend="Код"
          disabled={processLoading}
          inputMode="numeric"
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
            disabled={processLoading}
            text="Подтвердить"
            icon={<BiCheckCircle />}
            onClick={() => {}}
          />
        </div>
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={editManagerModal}
        setModalVisible={setEditManagerModal}
      >
        <p>Выберите менеджера</p>
        <Select
          value={newManager}
          options={managersWithStore}
          loading={managersLoading || processLoading}
          setValue={setNewManager}
          type={"managerswithstore"}
          style={{ margin: "10px 0" }}
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
            disabled={processLoading}
            text="Подтвердить"
            icon={<BiCheckCircle />}
            onClick={() => {
              if (
                window.confirm(
                  "Вы уверены что хотите поменять продавца этой продажи?"
                )
              ) {
                editOrderManager({
                  newManager,
                  setProcessLoading,
                  orderId: id,
                  next: () => navigate(0),
                });
              }
            }}
          />
        </div>
      </Modal>
      <Modal
        noEscape={processLoading}
        modalVisible={editDeliverModal}
        setModalVisible={setEditDeliverModal}
      >
        <p>Выберите курьера</p>
        <Select
          value={newDeliver}
          options={delivers}
          loading={deliversLoading || processLoading}
          setValue={setNewDeliver}
          type={"managers"}
          style={{ margin: "10px 0" }}
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
            disabled={processLoading}
            text="Подтвердить"
            icon={<BiCheckCircle />}
            onClick={() => {
              if (
                window.confirm(
                  "Вы уверены что хотите поменять курьера этой продажи?"
                )
              ) {
                editOrderDeliver({
                  newDeliver,
                  setProcessLoading,
                  orderId: id,
                  next: () => navigate(0),
                });
              }
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

export default OrderDetails;
