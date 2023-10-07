import axios from "axios";
import config from "../config/config.json";
// import Cookies from "universal-cookie";
import { errParser } from "./AuthService";

const { SERVER_URL, TOKEN_NAME } = config;
// const cookies = new Cookies();
let alert;

export const setAlertWarehouseService = (variable) => {
  alert = variable;
};

export const newAcceptance = async ({
  goods,
  date,
  comment,
  setNewAcceptLoading,
  next,
}) => {
  setNewAcceptLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/warehouse/newaccept`,
      { goods, date, comment },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(() => {
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setNewAcceptLoading(false);
    });
};

export const newWriteOff = async ({
  goods,
  date,
  comment,
  setNewAcceptLoading,
  next,
}) => {
  setNewAcceptLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/warehouse/newwriteoff`,
      { goods, date, comment },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(() => {
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setNewAcceptLoading(false);
    });
};

export const getInventory = async ({ setInventory, setIsInvLoading, type }) => {
  setIsInvLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .get(`${SERVER_URL}/api/warehouse/getinventory`, {
      params: {
        type,
      },
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(({ data }) => {
      const temp = [...data];
      temp.forEach((item) => {
        let sum = 0;
        let quantity = 0;
        item.goods.forEach((good) => {
          sum += parseInt(good.price) * parseInt(good.quantity);
          quantity += parseInt(good.quantity);
        });
        item.sum = sum;
        item.quantity = quantity;
      });
      setInventory(temp);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setIsInvLoading(false);
    });
};

export const getInventoryDetails = async ({
  setInventory,
  setIsLoading,
  id,
}) => {
  setIsLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .get(`${SERVER_URL}/api/warehouse/getinventorydetails`, {
      params: {
        id,
      },
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(({ data }) => {
      setInventory(data);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setIsLoading(false);
    });
};
