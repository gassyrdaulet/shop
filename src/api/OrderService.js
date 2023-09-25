import axios from "axios";
import config from "../config/config.json";
import Cookies from "universal-cookie";
import { errParser } from "./AuthService";
import { getAPIToken } from "./AuthService";

const { SERVER_URL, TOKEN_NAME, KASPI_API_URL } = config;
const cookies = new Cookies();
let alert;

export const setAlertOrderService = (variable) => {
  alert = variable;
};

export const getOrderDetails = async ({
  id,
  setData,
  setFetchLoading,
  next = () => {},
}) => {
  setFetchLoading(true);
  const token = await cookies.get(TOKEN_NAME);
  axios
    .get(`${SERVER_URL}/api/orders/getdetails`, {
      params: { id },
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(({ data }) => {
      setData(data);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setFetchLoading(false);
    });
};

export const getOrders = async ({
  setOrdersLoading,
  setOrders,
  status = "all",
}) => {
  setOrdersLoading(true);
  const token = await cookies.get(TOKEN_NAME);
  axios
    .get(`${SERVER_URL}/api/orders/getorders`, {
      params: { status },
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(({ data }) => {
      setOrders(data);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setOrdersLoading(false);
    });
};

export const getFinishedOrders = async ({
  setFinishedOrdersLoading,
  setFinishedOrders,
  firstDate,
  secondDate,
  dateType,
  delivery = true,
}) => {
  setFinishedOrdersLoading(true);
  const token = await cookies.get(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/orders/getfinished`,
      {
        firstDate,
        secondDate,
        dateType,
        delivery,
      },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      setFinishedOrders(data);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setFinishedOrdersLoading(false);
    });
};

export const newOrder = async ({ order, setNewOrderLoading, next }) => {
  setNewOrderLoading(true);
  const token = await cookies.get(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/orders/neworder`,
      { order },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(() => {
      alert("Успешно", `Вы успешно создали новый заказ.`);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setNewOrderLoading(false);
    });
};

export const isThereOrder = async ({ id, setProcessLoading, next }) => {
  setProcessLoading(true);
  const token = await cookies.get(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/orders/isthereorder`,
      { id },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      alert("Успешно", data?.message);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const issueCash = async ({
  order,
  setProcessLoading,
  payment,
  id,
  next,
}) => {
  try {
    setProcessLoading(true);
    const token = await cookies.get(TOKEN_NAME);
    await axios.post(
      `${SERVER_URL}/api/orders/editorder`,
      { order, orderId: id },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    );
    await axios.post(
      `${SERVER_URL}/api/orders/issuepickup`,
      { orderId: id, payment },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    );
    next();
  } catch (err) {
    alert("Ошибка!", errParser(err));
    setProcessLoading(false);
  }
};

export const cashOrder = async ({ order, setProcessLoading, next }) => {
  setProcessLoading(true);
  const token = await cookies.get(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/orders/cashorder`,
      { order },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(() => {
      alert("Успешно", `Вы успешно создали новый заказ.`);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const editOrder = async ({ order, setEditLoading, id, next }) => {
  setEditLoading(true);
  const token = await cookies.get(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/orders/editorder`,
      { order, orderId: id },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(() => {
      alert("Успешно", `Вы успешно отредактировали заказ.`);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setEditLoading(false);
    });
};

export const editOrderManager = async ({
  newManager,
  setProcessLoading,
  orderId,
  next,
}) => {
  setProcessLoading(true);
  const token = await cookies.get(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/orders/editmanager`,
      { managerId: newManager, orderId },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(() => {
      alert("Успешно", `Вы успешно отредактировали заказ.`);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const sendDeliver = async ({
  deliver,
  setProcessLoading,
  next,
  orderIds,
}) => {
  setProcessLoading(true);
  const token = await cookies.get(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/orders/senddeliver`,
      { deliver, ids: orderIds },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      alert("Успешно", data?.message);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const issueOrder = async ({ payment, id, setProcessLoading, next }) => {
  setProcessLoading(true);
  const token = await cookies.get(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/orders/issueorder`,
      { orderId: id, payment },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      alert("Успешно", data?.message);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const issuePickup = async ({ payment, id, setProcessLoading, next }) => {
  setProcessLoading(true);
  const token = await cookies.get(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/orders/issuepickup`,
      { orderId: id, payment },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      alert("Успешно", data?.message);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const finishOrder = async ({
  ids,
  setProcessLoading,
  deliver,
  next,
  deliveryList,
}) => {
  setProcessLoading(true);
  const token = await cookies.get(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/orders/finishorder`,
      { orderIds: ids, deliver, deliveryList },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      alert("Успешно", data?.message);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const cancelOrder = async ({ id, setProcessLoading, cause, next }) => {
  setProcessLoading(true);
  const token = await cookies.get(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/orders/cancelorder`,
      { orderId: id, cause },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      alert("Успешно", data?.message);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const recreateOrder = async ({ id, setProcessLoading, cause, next }) => {
  setProcessLoading(true);
  const token = await cookies.get(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/orders/recreateorder`,
      { orderId: id, cause },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      alert("Успешно", data?.message);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const returnOrder = async ({ id, setProcessLoading, cause, next }) => {
  setProcessLoading(true);
  const token = await cookies.get(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/orders/returnorder`,
      { orderId: id, cause },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      alert("Успешно", data?.message);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const sendKaspiCode = async ({
  order_id,
  setProcessLoading,
  managerId,
  code,
  confirm,
}) => {
  try {
    setProcessLoading(true);
    const api_token = await getAPIToken(managerId);
    console.log(KASPI_API_URL);
    const result = await fetch(KASPI_API_URL + "/shop/api/v2/orders", {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "orders",
          id: order_id,
          attributes: {
            status: "COMPLETED",
          },
        },
      }),
      headers: {
        "Content-Type": "application/vnd.api+json",
        "X-Auth-Token": api_token,
        "X-Send-Code": true,
        "X-Security-Code": code,
      },
    });
    console.log(result);
    // await axios.post(
    //   KASPI_API_URL + "/shop/api/v2/orders",
    //   {
    //     data: {
    //       type: "orders",
    //       id: order_id,
    //       attributes: {
    //         status: "COMPLETED",
    //       },
    //     },
    //   },
    //   {
    //     headers: {
    //       "Content-Type": "application/vnd.api+json",
    //       "X-Auth-Token": api_token,
    //       "X-Send-Code": true,
    //       "X-Security-Code": code,
    //     },
    //   }
    // );
    if (confirm) {
      alert("Успешно", "Код абсолютно верный!");
    } else {
      alert("Успешно", "Код отправлен!");
    }
    setProcessLoading(false);
  } catch (e) {
    console.log(e);
    setProcessLoading(false);
    alert(
      "Ошибка",
      e.response?.data?.errors ? e.response.data.errors[0].title : e.message
    );
  }
};
