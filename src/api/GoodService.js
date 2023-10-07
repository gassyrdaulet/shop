import axios from "axios";
import config from "../config/config.json";
// import Cookies from "universal-cookie";
import { errParser } from "./AuthService";

const { SERVER_URL, TOKEN_NAME } = config;
// const cookies = new Cookies();
let alert;

export const setAlertGoodService = (variable) => {
  alert = variable;
};

export const getInvCntrlType = async () => {
  try {
    // const token = await cookies.get(TOKEN_NAME);
    const token = localStorage.getItem(TOKEN_NAME);
    const { data } = await axios.get(
      `${SERVER_URL}/api/organization/getinvcntrltype`,
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    );
    const result = data["inventorycontroltype"];
    return result ? result : "lifo";
  } catch (e) {
    console.log("Invcntrltype Error. ", e);
    return "lifo";
  }
};

export const getGoods = async ({ setFetchGoodsLoading, setGoods }) => {
  setFetchGoodsLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  const invcntrltype = await getInvCntrlType();
  axios
    .get(`${SERVER_URL}/api/goods/all`, {
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(({ data }) => {
      const temp = data.map((item) => {
        const remainderTemp = item.remainder;
        if (invcntrltype === "lifo") {
          item.purchase = remainderTemp?.length
            ? remainderTemp[0].price
            : item.lastpurchase;
        } else if (invcntrltype === "fifo") {
          item.purchase = remainderTemp?.length
            ? remainderTemp[remainderTemp.length - 1].price
            : item.lastpurchase;
        }
        let quantity = 0;
        if (remainderTemp?.length) {
          remainderTemp.forEach((v) => {
            quantity = quantity + parseInt(v.quantity);
          });
        }
        item.remainder = quantity;
        item.inventories = remainderTemp;
        return item;
      });
      setGoods(temp);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setFetchGoodsLoading(false);
    });
};

export const getRelations = async ({ setFetchLoading, setRelations }) => {
  setFetchLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .get(`${SERVER_URL}/api/goods/getrelations`, {
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(({ data }) => {
      setRelations(data);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setFetchLoading(false);
    });
};

export const getGroups = async ({ setGroupsLoading, setGroups }) => {
  setGroupsLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .get(`${SERVER_URL}/api/goods/groups`, {
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(({ data }) => {
      setGroups([...data]);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setGroupsLoading(false);
    });
};

export const newGroup = async ({
  setNewGroupLoading,
  newGroupName,
  setNewGroupModal,
  update,
}) => {
  setNewGroupLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/goods/newgroup`,
      { name: newGroupName },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(() => {
      alert(
        "Успешно",
        `Новая группа  «${newGroupName}» была успешно добавлена.`
      );
      setNewGroupModal(false);
      update();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setNewGroupLoading(false);
    });
};

export const newRelation = async ({
  setNewRelationLoading,
  code,
  goods,
  next,
}) => {
  setNewRelationLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/goods/newrelation`,
      { code, goods },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      alert("Успешно", data.message);
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setNewRelationLoading(false);
    });
};

export const deleteGroup = async ({ setProcessLoading, id, update }) => {
  setProcessLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/goods/deletegroup`,
      { id },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(() => {
      update();
      alert("Успешно", `Группа с номером: «${id}» успешно удалена.`);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setProcessLoading(false);
    });
};

export const deleteRelation = async ({
  setProcessLoading,
  relationId,
  next,
}) => {
  setProcessLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/goods/deleterelation`,
      { relationId },
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

export const deleteGood = async ({ setDeleteGoodLoading, id, update }) => {
  setDeleteGoodLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/goods/deletegood`,
      { id },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(() => {
      update();
      alert("Успешно", `Товар с номером: «${id}» успешно удален.`);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setDeleteGoodLoading(false);
    });
};

export const fetchGroupInfo = async ({
  setEditGroupInfoLoading,
  setEditGroupName,
  id,
}) => {
  setEditGroupInfoLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/goods/fetchgroup`,
      { id },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      setEditGroupName(data.name);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setEditGroupInfoLoading(false);
    });
};

export const editGroup = async ({
  setEditGroupLoading,
  editGroupName,
  id,
  update,
}) => {
  setEditGroupLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/goods/editgroup`,
      { id, name: editGroupName },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(() => {
      update();
      alert("Успешно", "Вы успешно поменяли название группы.");
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setEditGroupLoading(false);
    });
};

export const editRelation = async ({
  setProcessLoading,
  goods,
  relationId,
  next,
}) => {
  setProcessLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/goods/editrelation`,
      { goods, relationId },
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

export const newGood = async ({ inputs, setNewGoodLoading, update }) => {
  const body = {};
  inputs.forEach((input) => {
    body[input.name] =
      input.name === "series" || input.name === "price"
        ? parseInt(input.value)
        : input.value;
  });
  setNewGoodLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(`${SERVER_URL}/api/goods/newgood`, body, {
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(() => {
      update();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setNewGoodLoading(false);
    });
};

export const editGood = async ({ inputs, setEditGoodLoading, id }) => {
  const body = {};
  inputs.forEach((input) => {
    body[input.name] =
      input.name === "series" || input.name === "price"
        ? parseInt(input.value)
        : input.value;
  });
  setEditGoodLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/goods/editgood`,
      { id, ...body },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(() => {
      alert("Успешно", "Товар был успешно отредактирован.");
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setEditGoodLoading(false);
    });
};

export const fetchGoodInfo = async ({ setInputs, setFetchLoading, id }) => {
  setFetchLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(
      `${SERVER_URL}/api/goods/getgood`,
      { id },
      {
        headers: {
          [TOKEN_NAME]: token,
        },
      }
    )
    .then(({ data }) => {
      setInputs((prev) => {
        const temp = [...prev];
        temp.forEach((input) => {
          if (input.name === "series") {
            if (data[input.name] === null || data[input.name] === undefined) {
              input.value = "-1";
              return;
            }
          }
          if (data[input.name] === null || data[input.name] === undefined) {
            input.value = "";
            return;
          }
          input.value = data[input.name];
        });
        return temp;
      });
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setFetchLoading(false);
    });
};

export const getBarcode = async ({ setBarcodeLoading, setBarcode }) => {
  setBarcodeLoading(true);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .get(`${SERVER_URL}/api/goods/getbarcode`, {
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(({ data }) => {
      setBarcode(data.barcode);
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setBarcodeLoading(false);
    });
};

export const uploadXLSX = async ({ file, setImportLoading, next }) => {
  setImportLoading(true);
  const formData = new FormData();
  formData.append("file", file, file.name);
  // const token = await cookies.get(TOKEN_NAME);
  const token = localStorage.getItem(TOKEN_NAME);
  axios
    .post(`${SERVER_URL}/api/goods/uploadxlsx`, formData, {
      headers: {
        [TOKEN_NAME]: token,
      },
    })
    .then(() => {
      next();
    })
    .catch((err) => {
      alert("Ошибка", errParser(err));
    })
    .finally(() => {
      setImportLoading(false);
    });
};

export const getGoodsAndGroups = async ({
  setFetchLoading,
  setGoods,
  setGroups,
  next,
}) => {
  try {
    // const token = await cookies.get(TOKEN_NAME);
    const token = localStorage.getItem(TOKEN_NAME);
    const invcntrltype = await getInvCntrlType();
    setFetchLoading(true);
    const { data } = await axios.get(`${SERVER_URL}/api/goods/all`, {
      headers: {
        [TOKEN_NAME]: token,
      },
    });
    const temp = data.map((item) => {
      const remainderTemp = item.remainder;
      if (invcntrltype === "lifo") {
        item.purchase = remainderTemp?.length
          ? remainderTemp[0].price
          : item.lastpurchase;
      } else if (invcntrltype === "fifo") {
        item.purchase = remainderTemp?.length
          ? remainderTemp[remainderTemp.length - 1].price
          : item.lastpurchase;
      }
      let quantity = 0;
      if (remainderTemp?.length) {
        remainderTemp.forEach((v) => {
          quantity = quantity + parseInt(v.quantity);
        });
      }
      item.remainder = quantity;
      item.inventories = remainderTemp;
      return item;
    });
    setGoods(temp);
    const { data: groups } = await axios.get(`${SERVER_URL}/api/goods/groups`, {
      headers: {
        [TOKEN_NAME]: token,
      },
    });
    setGroups([...groups]);
    next();
    setFetchLoading(false);
  } catch (err) {
    alert("Ошибка", errParser(err));
    setFetchLoading(false);
  }
};
