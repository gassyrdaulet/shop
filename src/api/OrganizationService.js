import axios from "axios";
import config from "../config/config.json";
// import Cookies from "universal-cookie";
import { errParser } from "./AuthService";

const { SERVER_URL, TOKEN_NAME } = config;
// const cookies = new Cookies();
let alert;

export const setAlertOrganizationService = (variable) => {
  alert = variable;
};

export const getCashbox = async ({ setCashboxLoading, setCashbox }) => {
  setCashboxLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .get(`${SERVER_URL}/api/organization/getcashbox`, {
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(({ data }) => {
      setCashbox(data.cashbox);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setCashboxLoading(false);
    });
};

export const newOrganization = async ({ setIsLoading, name, next }) => {
  setIsLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/organization/neworganization`,
      { name },
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
      setIsLoading(false);
    });
};

export const openCashbox = async ({ setCashboxLoading, next }) => {
  setCashboxLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/organization/newcashbox`,
      {},
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
      setCashboxLoading(false);
    });
};

export const closeCashbox = async ({ setProcessLoading, cashboxId, next }) => {
  setProcessLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/organization/closecashbox`,
      { cashboxId },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      alert("Успешно", data?.cashbox);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const addCashToCashbox = async ({
  setProcessLoading,
  amount,
  next,
  comment,
}) => {
  setProcessLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/organization/addcashtocashbox`,
      { amount, comment },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      alert("Успешно", data?.cashbox);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const removeCashFromCashbox = async ({
  setProcessLoading,
  amount,
  next,
  comment,
}) => {
  setProcessLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/organization/removecashfromcashbox`,
      { amount, comment },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      alert("Успешно", data?.cashbox);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const closeAnyCashbox = async ({ setProcessLoading, next }) => {
  setProcessLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/organization/closeanycashbox`,
      {},
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      alert("Успешно", data?.cashbox);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const getOrgInfo = async ({
  setData,
  setFetchLoading,
  setValue = () => {},
}) => {
  setFetchLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .get(`${SERVER_URL}/api/organization/getinfo`, {
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(({ data }) => {
      setData(data);
      const keys = Object.keys(data);
      for (let key of keys) {
        setValue(key, data[key]);
      }
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setFetchLoading(false);
    });
};

export const editOrgInfo = async ({ newData, setProcessLoading, next }) => {
  setProcessLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/organization/editorg`,
      { newData },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      next();
      alert("Успешно", data?.message);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const getManagers = async ({ setManagers, setManagersLoading }) => {
  setManagersLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .get(`${SERVER_URL}/api/organization/getusers`, {
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(({ data }) => {
      const managers = [];
      for (let user of data) {
        if (user.manager) {
          managers.push({
            value: user.id,
            name: user.name,
            id: user.id,
          });
        }
      }
      setManagers(managers);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setManagersLoading(false);
    });
};

export const getManagersForSummary = async ({
  setManagers,
  setManagersLoading,
}) => {
  setManagersLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .get(`${SERVER_URL}/api/organization/getusers`, {
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(({ data }) => {
      const requesterId = parseInt(localStorage.getItem("id"));
      let requesterRoles = {};
      const managers = [];
      for (let user of data) {
        if (user.id === requesterId) {
          requesterRoles = user;
        }
        if (user.manager) {
          managers.push({
            value: user.id,
            name: user.name,
            id: user.id,
          });
        }
      }
      if (requesterRoles.admin) {
        setManagers([
          { value: -2, name: "Все", id: -2 },
          { value: -1, name: "Магазин", id: -1 },
          ...managers,
        ]);
      } else {
        setManagers(
          [requesterRoles].map((item) => {
            return { value: item.id, name: item.name, id: item.id };
          })
        );
      }
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setManagersLoading(false);
    });
};

export const getUsers = async ({ setUsers, setFetchLoading }) => {
  setFetchLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .get(`${SERVER_URL}/api/organization/getusers`, {
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(({ data }) => {
      setUsers(data);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setFetchLoading(false);
    });
};

export const getSpendings = async ({
  setProcessLoading,
  setData,
  firstDate,
  secondDate,
}) => {
  setProcessLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/organization/getspendings`,
      {
        firstDate,
        secondDate,
      },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      setData(data);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const newSpending = async ({
  setProcessLoading,
  purpose,
  sum,
  comment,
  date,
  next,
}) => {
  setProcessLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/organization/newspending`,
      {
        purpose,
        sum,
        comment,
        date,
      },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(() => {
      next();
      alert("Успешно", `Вы успешно создали новый заказ.`);
    })
    .catch((err) => {
      console.log(err);
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const getCashboxes = async ({
  setProcessLoading,
  setData,
  firstDate,
  secondDate,
}) => {
  setProcessLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/organization/getcashboxes`,
      {
        firstDate,
        secondDate,
      },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      setData(data);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const addNewUser = async ({
  newUserInfo,
  id,
  setAddNewUserLoading,
  next,
}) => {
  setAddNewUserLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  newUserInfo.id = id;
  axios
    .post(
      `${SERVER_URL}/api/organization/addnewuser`,
      {
        newId: id,
        newUserInfo,
      },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      next();
      alert("Успешно", data.message);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setAddNewUserLoading(false);
    });
};

export const editUser = async ({
  editId,
  pickedUserInfo,
  setProcessLoading,
  next,
}) => {
  setProcessLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  pickedUserInfo.id = editId;
  axios
    .post(
      `${SERVER_URL}/api/organization/edituser`,
      {
        editId,
        pickedUserInfo,
      },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      next();
      alert("Успешно", data.message);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const deleteUser = async ({ deleteId, setProcessLoading, next }) => {
  setProcessLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/organization/deleteuser`,
      {
        deleteId,
      },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      next();
      alert("Успешно", data.message);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const getDelivers = async ({ setDelivers, setDeliversLoading }) => {
  setDeliversLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .get(`${SERVER_URL}/api/organization/getusers`, {
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(({ data }) => {
      const delivers = [];
      for (let user of data) {
        if (user.deliver) {
          delivers.push({
            value: user.id,
            name: user.name,
            id: user.id,
          });
        }
      }
      setDelivers(delivers);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setDeliversLoading(false);
    });
};
